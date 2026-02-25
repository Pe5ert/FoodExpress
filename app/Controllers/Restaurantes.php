<?php

namespace App\Controllers;

use App\Services\SupabaseService;
use CodeIgniter\Controller;

class Restaurantes extends Controller
{
    public function index()
    {
        $supabase = new SupabaseService();
        $dados = $supabase->get('restaurantes');

        return $this->response->setJSON($dados);
    }
}