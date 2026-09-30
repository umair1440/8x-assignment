<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('old_price', 10, 2)->nullable();
            $table->string('brand')->nullable()->index();
            $table->string('sku')->nullable()->unique();
            $table->unsignedInteger('stock')->default(0);
            $table->string('image_url')->nullable();
            $table->json('images')->nullable();
            $table->json('colors')->nullable();
            $table->json('sizes')->nullable();
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->string('status')->default('active')->index();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_deal')->default(false);
            $table->timestamp('deal_ends_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index('seller_id');
            $table->index(['category_id', 'status']);
            $table->index('price');
            $table->index('rating_avg');
            $table->index('stock');
            $table->index('is_featured');
            $table->index('is_deal');
            $table->index('deal_ends_at');
            $table->index('deleted_at');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};