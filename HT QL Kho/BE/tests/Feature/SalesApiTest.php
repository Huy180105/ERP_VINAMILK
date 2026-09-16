<?php

namespace Tests\Feature;

use Tests\TestCase;

class SalesApiTest extends TestCase
{
    public function test_sales_dashboard_endpoint_returns_success_response(): void
    {
        $response = $this->getJson('/api/warehouse/sales/dashboard');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'summary',
                         'orders',
                         'customers',
                         'deliveries',
                         'invoices',
                         'receivables',
                     ],
                 ]);
    }
}
