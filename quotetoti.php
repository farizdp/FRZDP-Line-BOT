<?php

function stringExtract($item, $start, $end) {
    if (($startPos = stripos($item, $start)) === false) {
        return false;
    } else if (($endPos = stripos($item, $end)) === false) {
        return false;
    } else {
        $substrStart = $startPos + strlen($start);
        return substr($item, $substrStart, $endPos - $substrStart);
    }
}

$url = "***TOTI URL address***";
$username = "***username***";
$password = "***password***";
$cookie = "cookie.txt";
$postdata = "username=".$username."&password=".$password."&submit=login";

$ch = curl_init();
curl_setopt ($ch, CURLOPT_URL, $url);
curl_setopt ($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt ($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1a2pre) Gecko/2008073000 Shredder/3.0a2pre ThunderBrowse/3.2.1.8");
curl_setopt ($ch, CURLOPT_TIMEOUT, 60);
curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt ($ch, CURLOPT_COOKIEJAR, $cookie);
curl_setopt ($ch, CURLOPT_POSTFIELDS, $postdata);
curl_setopt ($ch, CURLOPT_POST, 1);
curl_setopt ($ch, CURLOPT_FOLLOWLOCATION, true);
$result = curl_exec ($ch);
curl_close($ch);

$quote = stringExtract($result, '<h3><i>', '</i></h3>');
$quote = preg_replace('/\r|\n/', '', $quote);
$quote = strip_tags($quote);
$quote = str_replace("- ", "\n\n- ", $quote);
echo $quote;
