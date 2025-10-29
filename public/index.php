<?php
require __DIR__ . '/../vendor/autoload.php';

$loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../templates');
$twig = new \Twig\Environment($loader, ['cache' => false]);

$page = $_GET['page'] ?? 'landing';
$allow = ['landing','login','signup','dashboard','tickets'];
if (!in_array($page, $allow)) $page = 'landing';

echo $twig->render("$page.twig", [
  'year' => date('Y')
]);
