<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Mood;
use Carbon\Carbon;

class MoodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Bersihkan data mood lama terlebih dahulu agar tidak menumpuk
        Mood::truncate();

        $moodLabels = [
            1 => 'Sangat Sedih',
            2 => 'Sedih',
            3 => 'Netral',
            4 => 'Senang',
            5 => 'Sangat Senang'
        ];

        // Membuat 7 data terbaru selama 7 hari terakhir secara berurutan
        // Iterasi dari 6 hari yang lalu (index 6) sampai hari ini (index 0)
        for ($i = 6; $i >= 0; $i--) {
            $randomScore = rand(1, 5);
            
            Mood::create([
                'user_id' => 'dummy_user_id',
                'mood'    => $moodLabels[$randomScore],
                'score'   => $randomScore,
                'tanggal' => Carbon::now()->subDays($i)->toDateTimeString(),
                'catatan' => 'Catatan jurnal otomatis dari seeder hari ke-' . (7 - $i)
            ]);
        }
    }
}
