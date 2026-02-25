<?php

namespace App\Services;

class SupabaseService
{
    private $url;
    private $key;
    private $client;

    public function __construct()
    {
        $this->url = getenv('SUPABASE_URL');
        $this->key = getenv('SUPABASE_KEY');
        $this->client = \Config\Services::curlrequest();
    }

    public function get($table)
    {
        $response = $this->client->request(
            'GET',
            $this->url . "/rest/v1/" . $table,
            [
                'headers' => [
                    'apikey' => $this->key,
                    'Authorization' => 'Bearer ' . $this->key,
                    'Content-Type' => 'application/json'
                ]
            ]
        );

        return json_decode($response->getBody());
    }

    public function insert($table, $data)
    {   
        $response = $this->client->request(
            'POST',
            $this->url . "/rest/v1/" . $table,
            [
                'headers' => [
                    'apikey' => $this->key,
                    'Authorization' => 'Bearer ' . $this->key,
                    'Content-Type' => 'application/json',
                    'Prefer' => 'return=representation'
                ],
                'json' => $data
            ]
        );

        return json_decode($response->getBody());
    }
}