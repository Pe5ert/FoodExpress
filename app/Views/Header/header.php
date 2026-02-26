/**  Página padrão pra todos os usuários que acessam o sistema */
<!DOCTYPE html>
<html lang="pt-br"> 
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delivery</title>
    <link rel="stylesheet" href="<?php echo base_url('css/style.css'); ?>">

</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="<?php echo base_url('/'); ?>">Home</a></li>
                <li><a href="<?php echo base_url('/cliente'); ?>">Cliente</a></li>
                <li><a href="<?php echo base_url('/restaurante'); ?>">Restaurante</a></li>
                <li><a href="<?php echo base_url('/motoboy'); ?>">Motoboy</a></li>
            </ul>
        </nav>
    </header>