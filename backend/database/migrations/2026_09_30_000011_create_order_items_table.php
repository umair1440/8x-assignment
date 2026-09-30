<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->foreignId('seller_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title_snapshot');
            $table->string('image_snapshot')->nullable();
            $table->decimal('price_snapshot', 10, 2);
            $table->unsignedInteger('quantity');
            $table->string('variant_color')->default('');
            $table->string('variant_size')->default('');
            $table->string('status')->default('placed')->index();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            $table->index('order_id');
            $table->index('product_id');
            $table->index('seller_id');
            $table->index('shipped_at');
            $table->index('delivered_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};