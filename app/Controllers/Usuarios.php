<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use App\Services\SupabaseService;

class Usuarios extends Controller
{
    public function teste()
    { 
        $supabase = new \App\Services\SupabaseService();
        $dados = $supabase->get('usuarios');

        return $this->response->setJSON($dados);
    }
}