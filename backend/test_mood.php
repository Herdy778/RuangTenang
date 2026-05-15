<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::first();
$request = new Illuminate\Http\Request();
$request->merge([
    'auth_user' => $user,
    'mood' => 'Netral',
    'score' => 3,
    'catatan' => 'Tes'
]);
$controller = new App\Http\Controllers\Api\MoodController();
$response = $controller->store($request);
echo "STORE RESPONSE:\n";
echo $response->getContent() . "\n";

echo "INDEX RESPONSE:\n";
$indexResponse = $controller->index($request);
echo $indexResponse->getContent() . "\n";
