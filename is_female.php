<?php

const MALE_NAMES = ['Данила', 'Никита', 'Илья'];
const FEMALE_NAMES = ['Асыл', 'Керри'];
const FEMALE_LAST_NAME_ENDINGS = ['ева', 'ова', 'ина'];
const FEMALE_FIRST_NAME_ENDINGS = ['а', 'я'];

function isFemale(string $lastName, string $firstName = '', string $title = ''): bool {
    return substr($title, 0, 1) === 'W'
        || in_array(mb_substr($lastName, -3), FEMALE_LAST_NAME_ENDINGS)
        || in_array(mb_substr($firstName, -1), FEMALE_FIRST_NAME_ENDINGS) && !in_array($firstName, MALE_NAMES)
        || in_array($firstName, FEMALE_NAMES);
}
