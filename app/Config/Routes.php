<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->get('/restaurantes', 'Restaurantes::index');
$routes->get('usuarios/criar', 'Usuarios::criar');
$routes->get('teste', 'Usuarios::teste');