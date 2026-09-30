<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AdminOrderIndexRequest;
use App\Http\Requests\Api\AdminOrderStatusRequest;
use App\Http\Requests\Api\AdminUserIndexRequest;
use App\Http\Resources\Api\AdminOrderResource;
use App\Http\Resources\Api\AdminSummaryResource;
use App\Http\Resources\Api\AdminUserResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminController extends Controller
{
    public function summary(): AdminSummaryResource
    {
        $start = now()->startOfDay()->subDays(6);
        $end = now()->endOfDay();
        $dailyRows = Order::query()
            ->where('status', '!=', 'cancelled')
            ->whereBetween('placed_at', [$start, $end])
            ->selectRaw('DATE(placed_at) as revenue_date, SUM(total) as revenue')
            ->groupByRaw('DATE(placed_at)')
            ->pluck('revenue', 'revenue_date');
        $dailyRevenue = collect(range(0, 6))->map(function (int $offset) use ($dailyRows, $start): array {
            $date = $start->copy()->addDays($offset)->toDateString();

            return ['date' => $date, 'revenue' => number_format((float) ($dailyRows[$date] ?? 0), 2, '.', '')];
        });

        return AdminSummaryResource::make([
            'total_revenue' => number_format((float) Order::query()->where('status', '!=', 'cancelled')->sum('total'), 2, '.', ''),
            'orders_count' => Order::query()->count(),
            'users_count' => User::query()->count(),
            'products_count' => Product::query()->count(),
            'revenue_last_7_days' => $dailyRevenue,
            'latest_orders' => Order::query()->with('user')->latest('placed_at')->limit(5)->get(),
        ]);
    }

    public function indexUsers(AdminUserIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $query = $this->usersWithStats();
        if (filled($filters['q'] ?? null)) {
            $term = '%'.$filters['q'].'%';
            $query->where(fn (Builder $users) => $users->where('name', 'like', $term)->orWhere('email', 'like', $term));
        }

        return AdminUserResource::collection($query->latest()->paginate((int) ($filters['per_page'] ?? 20))->withQueryString());
    }

    public function showUser(int $id): AdminUserResource
    {
        return AdminUserResource::make($this->usersWithStats()->findOrFail($id));
    }

    public function indexOrders(AdminOrderIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $query = Order::query()->with('user');
        if (filled($filters['q'] ?? null)) {
            $term = '%'.$filters['q'].'%';
            $query->where(fn (Builder $orders) => $orders
                ->where('order_number', 'like', $term)
                ->orWhereHas('user', fn (Builder $users) => $users->where('name', 'like', $term)->orWhere('email', 'like', $term)));
        }
        if (filled($filters['status'] ?? null)) {
            $query->where('status', $filters['status']);
        }

        return AdminOrderResource::collection($query->latest('placed_at')->paginate((int) ($filters['per_page'] ?? 20))->withQueryString());
    }

    public function showOrder(int $id): AdminOrderResource
    {
        return AdminOrderResource::make(Order::query()->with(['user', 'items'])->findOrFail($id));
    }

    public function updateOrderStatus(AdminOrderStatusRequest $request, int $id): AdminOrderResource
    {
        $order = Order::query()->findOrFail($id);
        $order->update($request->validated());

        return AdminOrderResource::make($order->refresh()->load('user'));
    }

    private function usersWithStats(): Builder
    {
        return User::query()
            ->withCount('orders')
            ->withSum(['orders as total_spent' => fn (Builder $orders) => $orders->where('status', '!=', 'cancelled')], 'total');
    }
}
