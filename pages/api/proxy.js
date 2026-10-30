export default async function handler(req, res) {
  const { type, q } = req.query;
  const apiKey = process.env.SUMOPOD_API_KEY || "YOUR_API_KEY";

  let endpointMap = {
    hospital: "https://api-services.sumopod.com/api/v1/rumah-sakit",
    university: "https://api-services.sumopod.com/api/v1/universitas",
    school: "https://api-services.sumopod.com/api/v1/sekolah",
    wilayah: "https://api-services.sumopod.com/api/v1/wilayah/provinsi",
  };

  let url = endpointMap[type] || endpointMap.hospital;
  if (q) url += `?q=${encodeURIComponent(q)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({ error: error.message, data: [] });
  }
}
