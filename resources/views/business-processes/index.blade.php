<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Business Processes</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            background: #f5f7fa;
            color: #1f2937;
        }

        .container {
            max-width: 1100px;
            margin: 40px auto;
            padding: 0 20px;
        }

        h1 {
            margin-bottom: 8px;
        }

        .subtitle {
            color: #6b7280;
            margin-bottom: 30px;
        }

        .card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .card h2 {
            margin-top: 0;
            margin-bottom: 8px;
        }

        .description {
            color: #6b7280;
            margin-bottom: 15px;
        }

        .status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            background: #e5e7eb;
            font-size: 14px;
        }

        .empty {
            background: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px;
            color: #6b7280;
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Business Processes</h1>

    <p class="subtitle">
        Daftar proses bisnis OCMS NCB INTERPOL
    </p>

    @if ($businessProcesses->count())

        @foreach ($businessProcesses as $businessProcess)

            <div class="card">

                <h2>
                    {{ $businessProcess->name }}
                </h2>

                @if ($businessProcess->description)
                    <div class="description">
                        {{ $businessProcess->description }}
                    </div>
                @endif

                <span class="status">
                    {{ $businessProcess->status }}
                </span>

            </div>

        @endforeach

    @else

        <div class="empty">
            Belum ada business process.
        </div>

    @endif

</div>

</body>
</html>