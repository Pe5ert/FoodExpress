<?php

namespace App\Controllers;

class Usuarios extends BaseController
{
    public function index(): string
    {
        return view ('Usuarios/index');
    }
}
 