<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use MongoDB\BSON\ObjectId;

class ImportAsliCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:import-asli';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import semua data dari file JSON di database/raw_data ke database MongoDB tim';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $importPath = database_path('raw_data');

        if (!File::exists($importPath)) {
            $this->error("Folder {$importPath} tidak ditemukan. Silakan jalankan 'php artisan db:export-asli' terlebih dahulu.");
            return 1;
        }

        $files = File::files($importPath);

        if (empty($files)) {
            $this->warn("Tidak ada file JSON yang ditemukan di folder {$importPath}.");
            return 0;
        }

        $this->info('Memulai import data ke MongoDB...');
        $db = DB::connection('mongodb');

        foreach ($files as $file) {
            if ($file->getExtension() !== 'json') {
                continue;
            }

            $collection = $file->getFilenameWithoutExtension();
            $this->info("Mengimport data untuk collection: {$collection}");

            $content = File::get($file->getPathname());
            
            // Gunakan true pada json_decode agar hasilnya menjadi array asosiatif
            $data = json_decode($content, true);

            if (!is_array($data)) {
                $this->error("  -> Gagal memproses file {$file->getFilename()}. Format JSON tidak valid.");
                continue;
            }

            $totalDocs = count($data);
            
            if ($totalDocs === 0) {
                $this->line("  -> File {$file->getFilename()} kosong, melewati...");
                continue;
            }

            // Hapus data lama di dalam collection sebelum import, ini memastikan data aslinya di tim sama persis
            $db->collection($collection)->truncate();

            // Memperbaiki kembali tipe data seperti ObjectId sebelum diinsert
            $data = array_map(function ($item) {
                return $this->restoreMongoTypes($item);
            }, $data);

            // Memasukkan data baru menggunakan chunk insert untuk menghindari batasan memory / paket maksimal
            $chunks = array_chunk($data, 500);
            foreach ($chunks as $chunk) {
                $db->collection($collection)->insert($chunk);
            }

            $this->line("  -> Berhasil mengimport {$totalDocs} dokumen ke collection {$collection}");
        }

        $this->info('Import selesai! Semua data sudah diperbarui sesuai data asli Anda.');
        return 0;
    }

    /**
     * Method untuk memulihkan tipe data MongoDB yang hilang ketika menjadi string JSON.
     * Khususnya untuk field ObjectId seperti `_id` dan `*_id`.
     */
    protected function restoreMongoTypes($item)
    {
        if (!is_array($item)) return $item;

        // Cek jika ini adalah representsi BSON ObjectId misalnya {"$oid": "..."}
        if (isset($item['$oid'])) {
            try {
                return new ObjectId($item['$oid']);
            } catch (\Exception $e) {
                return $item;
            }
        }

        // Cek jika ini adalah representsi BSON Date misalnya {"$date": "..."}
        if (isset($item['$date'])) {
            try {
                if (is_string($item['$date'])) {
                    return new \MongoDB\BSON\UTCDateTime(strtotime($item['$date']) * 1000);
                } elseif (is_array($item['$date']) && isset($item['$date']['$numberLong'])) {
                    return new \MongoDB\BSON\UTCDateTime((int)$item['$date']['$numberLong']);
                }
            } catch (\Exception $e) {
                return $item;
            }
        }

        foreach ($item as $key => &$value) {
            if (is_array($value)) {
                // Proses rekursif untuk array / sub-document
                $value = $this->restoreMongoTypes($value);
            } elseif (is_string($value)) {
                // Konfirmasi apakah field ini sepertinya plain string ObjectId
                if (
                    ($key === '_id' || str_ends_with($key, '_id')) && 
                    preg_match('/^[a-f\d]{24}$/i', $value)
                ) {
                    try {
                        $value = new ObjectId($value);
                    } catch (\Exception $e) {
                        // fallback
                    }
                }
            }
        }

        return $item;
    }
}
