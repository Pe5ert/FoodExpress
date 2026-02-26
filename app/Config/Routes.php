<?php namespace Config;

// Create a new instance of our RouteCollection class.
$routes = Services::routes();

// Load the system's routing file first, so that the app and ENVIRONMENT
// can override as needed.
if (file_exists(SYSTEMPATH . 'Config/Routes.php'))
{
    require SYSTEMPATH . 'Config/Routes.php';
}

/**
 * Router Setup
    */
  $routes->setDefaultNamespace('App\Controllers');
  $routes->setDefaultController('Home');
  $routes->setDefaultMethod('index');
  $routes->setTranslateURIDashes(false);
  $routes->set404Override();
  $routes->setAutoRoute(true);
 
$routes->get('/', 'Home::index'); /**  isso reforça a rota para acessar a página inicial do site */
