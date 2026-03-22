<?php

namespace App\Models;

// PENTING: Gunakan Model dari class MongoDB, bukan bawaan Laravel
use MongoDB\Laravel\Eloquent\Model;

class Article extends Model
{
    // Beri tahu Laravel nama collection-nya di database
    protected $collection = 'articles';

    // Kolom apa saja yang boleh diisi/ditambahkan (Mass Assignment)
    protected $fillable = ['judul_artikel', 'isi_konten', 'kategori_tag', 'thumbnail_url'];
}
