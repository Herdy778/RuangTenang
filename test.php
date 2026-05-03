<?php
$data = json_encode([
    'perasaan_sedih' => 0,
    'minat_kegiatan' => 0,
    'kualitas_tidur' => 0,
    'tingkat_lelah' => 0,
    'kesulitan_konsentrasi' => 0,
    'teks_curhat' => 'test'
]);
$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\nAccept: application/json\r\n",
        'method'  => 'POST',
        'content' => $data,
        'ignore_errors' => true
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents('http://127.0.0.1:8000/api/journal/analyze', false, $context);
print_r($http_response_header);
echo $result;
