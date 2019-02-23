<?php

require_once('is_female.php');

const COUNTRY = 'RUS';
const SAVES_PATH = 'saves' . DIRECTORY_SEPARATOR;
const SMW_PATH = 'smw' . DIRECTORY_SEPARATOR;

if ($_POST) {
    if (empty($_POST['filename'])) {
        exit;
    }
    $filename = $_POST['filename'];
    unset($_POST['filename']);
    file_put_contents(SAVES_PATH . $filename . '.json', json_encode($_POST));
    echo 'Данные сохранены на сервере.';
} else {
    require('index.phtml');
    exit;
}

if (!file_exists(SAVES_PATH . $filename . '.json')) {
    exit;
}

$json = file_get_contents(SAVES_PATH . $filename . '.json');
$data = json_decode($json);
$tournamentFile = fopen(SMW_PATH . $filename . '.smw', 'w');
$playersCount = count($data->last_name); // 0-300
$roundsCount = (int) $data->tournament_rounds_count; // 1-64
if ($roundsCount < 1 || $roundsCount > 64) {
    $roundsCount = 9;
}
$firstLine = sprintf('%s %s 0 0 0', $playersCount, $roundsCount) . PHP_EOL;
fputs($tournamentFile, $firstLine);
$score = '';
$color = 'W';
for ($i = 0; $i < $playersCount; ++$i) {
    $lastName = mb_convert_encoding($data->last_name[$i], 'CP1251', 'UTF8');
    $firstName = mb_convert_encoding($data->first_name[$i], 'CP1251', 'UTF8');
    $line = sprintf('%-4s%-4s%-27s%-6s%-5s%-4s%8s%3s%3s %s',
        $i + 1,
        $i + 1,
        substr($lastName . ' ' . $firstName, 0, 26),
        $data->rating[$i] !== '' ? $data->rating[$i] : '0',
        $data->title[$i],
        COUNTRY,
        $data->id_fide[$i],
        $score,
        $color,
        str_repeat(' v  -1--   ', $roundsCount)
    ) . PHP_EOL;
    fputs($tournamentFile, $line);
}
fputs($tournamentFile, '$' . substr(mb_convert_encoding($data->tournament_name, 'CP1251', 'UTF8'), 0, 63) . PHP_EOL);
fputs($tournamentFile, '1 0 0' . PHP_EOL);
fputs($tournamentFile, '$0' . PHP_EOL);
fputs($tournamentFile, '$0 4' . PHP_EOL);
fputs($tournamentFile, '$0' . PHP_EOL);
fputs($tournamentFile, '$0' . PHP_EOL);
fputs($tournamentFile, '$Additional tournament data for Swiss Master for Windows -- do not remove this line' . PHP_EOL);
fputs($tournamentFile, '1 2 0 0 0 0 0 0 0 0 0 0 ' . PHP_EOL); // rating, Buchholz
fputs($tournamentFile, '$' . substr(mb_convert_encoding($data->chief_arbiter, 'CP1251', 'UTF8'), 0, 63) . PHP_EOL);
fputs($tournamentFile, '$' . substr(mb_convert_encoding($data->tournament_place, 'CP1251', 'UTF8'), 0, 63) . PHP_EOL);
fputs($tournamentFile, '$' . COUNTRY . PHP_EOL);
fputs($tournamentFile, '$' . PHP_EOL);
fputs($tournamentFile, '$' . PHP_EOL);
fputs($tournamentFile, '$' . PHP_EOL);
fputs($tournamentFile, '$Additional player data for Swiss Master for Windows -- do not remove this line' . PHP_EOL);
for ($i = 0; $i < $playersCount; ++$i) {
    $line = sprintf('%1s %02s-%02s-%4s "" ""',
        isFemale($data->last_name[$i], $data->first_name[$i], $data->title[$i]) ? 'F' : 'M',
        $data->birth_day[$i] !== '' ? $data->birth_day[$i] : '..',
        $data->birth_month[$i] !== '' ? $data->birth_month[$i] : '..',
        $data->birth_year[$i] !== '' ? $data->birth_year[$i] : '....'
    ) . PHP_EOL;
    fputs($tournamentFile, $line);
}
fclose($tournamentFile);
