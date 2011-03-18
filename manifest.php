<?php

error_reporting(E_ALL);

$excludeFiles = array(
  './manifest.php',
  './jqtouch/jquery.1.3.2.min.js',
  './jqtouch/jqtouch.js',
);

$excludeDirs = array(
  './.git/',
);


/**
 * This simple script will create a manifest file for offline web apps.
 * It ensures that whenever a user of this app is online, all files will be
 * reloaded if this cache file changes.
 * Extend $excludeFiles or $excludeDirs with files you'd not want to be cached.
 * I refer to http://ofps.oreilly.com/titles/9780596805784/ch06.html for
 * more advanced manifest options.
 */ 

function strpos_array($haystack, array $needles) {
  $pos = null;
  foreach ($needles as $needle) {
    $pos = strpos($haystack, $needle);

    if ($pos !== false) {
      return $pos;
    }
  }

  return False;
}

header('Content-Type: text/cache-manifest');
echo "CACHE MANIFEST\n";

$hashes = "";

$dir = new RecursiveDirectoryIterator(".");
foreach(new RecursiveIteratorIterator($dir) as $file) {
  if ($file->IsFile() &&
      !in_array($file, $excludeFiles) &&
      (strpos_array($file, $excludeDirs) === false) &&
      (substr($file->getFilename(), 0, 1) != "."))
  {
    echo $file . "\n";
    $hashes .= md5_file($file);
  }
}

// print current "version"
echo "# Hash: " . md5($hashes) . "\n";
