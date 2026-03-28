<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RelaxationSession;
use Carbon\Carbon;

class RelaxationSessionSeeder extends Seeder
{
    public function run(): void
    {
        $sessions = [
            ['jenis' => 'Pernapasan 4-7-8', 'durasi' => 5],
            ['jenis' => 'Meditasi Kesadaran', 'durasi' => 10],
            ['jenis' => 'Pernapasan Perut', 'durasi' => 3],
            ['jenis' => 'Relaksasi Otot', 'durasi' => 15],
            ['jenis' => '5-4-3-2-1', 'durasi' => 5],
        ];

        foreach ($sessions as $i => $s) {
            RelaxationSession::create([
                'user_id' => 'user_dummy_123',
                'jenis_relaksasi' => $s['jenis'],
                'durasi_menit' => $s['durasi'],
                'tanggal' => Carbon::now()->subDays($i),
            ]);
        }
    }
}
