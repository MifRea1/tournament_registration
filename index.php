<?php

if ($_POST) {
    file_put_contents('saved.json', json_encode($_POST));
    return;
}

header('Location: table.html');