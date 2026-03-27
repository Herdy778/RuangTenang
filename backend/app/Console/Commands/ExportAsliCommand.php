<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ExportAsliCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:export-asli';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Eksport semua data dari collection MongoDB ke file JSON di folder database/raw_data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai ekspor data dari MongoDB...');

        $db = DB::connection('mongodb');
        
        try {
            // Mengambil instance MongoDB\Database untuk mendapatkan nama collection
            $database = $db->getMongoDB();
            $collections = [];
            foreach ($database->listCollections() as $collection) {
                $collectionName = $collection->getName();
                // Lewati collection sistem
                if (!str_starts_with($collectionName, 'system.')) {
                    $collections[] = $collectionName;
                }
            }
        } catch (\Exception $e) {
            $this->error('Gagal mengambil daftar collection: ' . $e->getMessage());
            return 1;
        }

        if (empty($collections)) {
            $this->warn('Tidak ada collection / table yang ditemukan di database.');
            return 0;
        }

        $exportPath = database_path('raw_data');

        // Buat folder jika belum ada
        if (!File::exists($exportPath)) {
            File::makeDirectory($exportPath, 0755, true);
        }

        foreach ($collections as $collection) {
            $this->info("Mengekspor collection: {$collection}");

            // Mengambil semua data dari collection
            $data = $db->collection($collection)->get();
            
            // Konversi ke format JSON yang dapat dibaca manusia
            $json = $data->toJson(JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

            $filePath = $exportPath . '/' . $collection . '.json';
            File::put($filePath, $json);

            $this->line("  -> Berhasil menyimpan " . count($data) . " dokumen ke {$collection}.json");
        }

        $this->info("Ekspor selesai! Semua data tersimpan di: {$exportPath}");
        return 0;
    }
}
