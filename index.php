<?php

if ($_POST) {
    file_put_contents('saved.json', json_encode($_POST));
} else {
    return header('Location: table.html');
}

if (!file_exists('saved.json')) {
    return;
}

$json = file_get_contents('saved.json');
$data = json_decode($json);
$tournamentFile = fopen(date('ymd') . '.smw', 'w');
$count = count($data->last_name);
$rounds = 9;
$firstLine = sprintf('%s %s 0 0 0', $count, $rounds) . PHP_EOL;
fputs($tournamentFile, $firstLine);
for ($i = 0; $i < $count; ++$i) {
    $name = substr(
        mb_convert_encoding($data->last_name[$i], 'CP1251', 'UTF8') . ' '
        . mb_convert_encoding($data->first_name[$i], 'CP1251', 'UTF8'),
        0, 27
    );
    $title = '';
    $country = 'RUS';
    $id = '';
    $score = '';
    $color = 'W';
    $line = sprintf('%-4s%-4s%-27s%-6s%-5s%-4s%8s%3s%3s %s',
        $i + 1,
        $i + 1,
        $name,
        $data->rating[$i] !== '' ? $data->rating[$i] : '0',
        $title,
        $country,
        $id,
        $score,
        $color,
        str_repeat(' v  -1--   ', $rounds)
    ) . PHP_EOL;
    fputs($tournamentFile, $line);
}
fputs($tournamentFile, '$' . PHP_EOL);
fputs($tournamentFile, '1 0 0' . PHP_EOL);
fputs($tournamentFile, '$0' . PHP_EOL);
fputs($tournamentFile, '$0 4' . PHP_EOL);
fputs($tournamentFile, '$0' . PHP_EOL);
fputs($tournamentFile, '$0' . PHP_EOL);
fputs($tournamentFile, '$Additional tournament data for Swiss Master for Windows -- do not remove this line' . PHP_EOL);
fputs($tournamentFile, '1 0 0 0 0 0 0 0 0 0 0 0' . PHP_EOL);
fputs($tournamentFile, '$' . PHP_EOL);
fputs($tournamentFile, '$' . PHP_EOL);
fputs($tournamentFile, '$' . PHP_EOL);
fputs($tournamentFile, '$' . PHP_EOL);
fputs($tournamentFile, '$' . PHP_EOL);
fputs($tournamentFile, '$' . PHP_EOL);
fputs($tournamentFile, '$Additional player data for Swiss Master for Windows -- do not remove this line' . PHP_EOL);
for ($i = 0; $i < $count; ++$i) {
    $line = sprintf('M %2s-%2s-%4s "" ""',
        $data->birth_day[$i] !== '' ? $data->birth_day[$i] : '..',
        $data->birth_month[$i] !== '' ? $data->birth_month[$i] : '..',
        $data->birth_year[$i] !== '' ? $data->birth_year[$i] : '....'
    ) . PHP_EOL;
    fputs($tournamentFile, $line);
}
fclose($tournamentFile);
