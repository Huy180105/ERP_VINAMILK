<?php

namespace Tests\Feature;

use Tests\TestCase;

class SalesApiTest extends TestCase
{
    public function test_sales_context_is_available_without_authentication(): void
    {
        $response = $this->getJson('/api/warehouse/sales/me');

        $response->assertOk()->assertJsonPath('data.sales_role', 'manager');
        $this->assertNull($response->json('data.id'));
    }
}
