import { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => <p className="p-4 text-center">Memuat Peta...</p>,
});

export default function Home() {
  const [activeTab, setActiveTab] = useState("hospital");
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async (type) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/proxy?type=${type}&q=${search}`);
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        setData(getMockData(type));
      } else {
        setData(json.data || json || getMockData(type));
      }
    } catch (err) {
      setError("Gagal mengambil data dari server, menggunakan data demo.");
      setData(getMockData(type));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(activeTab);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            🇮🇩 Direktori Indonesia (RS, Kampus, Sekolah)
          </h1>
          <span className="text-xs bg-blue-500 px-3 py-1 rounded-full font-medium">
            Powered by Sumopod API
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: "hospital", label: "🏥 Rumah Sakit" },
            { id: "university", label: "🎓 Universitas" },
            { id: "school", label: "🏫 Sekolah" },
            { id: "wilayah", label: "🗺️ Wilayah & Daerah" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedItem(null);
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder={`Cari ${activeTab === "hospital" ? "nama rumah sakit..." : activeTab === "university" ? "nama universitas..." : "nama sekolah/wilayah..."}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Cari
          </button>
        </form>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm">
            {error} (Menampilkan mode demo)
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* List & Results */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col h-[650px] overflow-hidden">
            <h2 className="font-bold text-lg mb-3 pb-2 border-b border-slate-100 flex justify-between items-center">
              <span>Hasil Pencarian</span>
              <span className="text-xs font-normal text-slate-500">
                {Array.isArray(data) ? `${data.length} ditemukan` : "Memuat..."}
              </span>
            </h2>

            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {loading ? (
                <div className="flex justify-center items-center h-48 text-slate-400">
                  Memuat data...
                </div>
              ) : Array.isArray(data) && data.length > 0 ? (
                data.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedItem === item
                        ? "border-blue-500 bg-blue-50/50 shadow-sm"
                        : "border-slate-100 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <h3 className="font-bold text-slate-800">
                      {item.name || item.nama || item.title || "Tanpa Nama"}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {item.address || item.alamat || item.lokasi || "Indonesia"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {item.code && (
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          Kode: {item.code}
                        </span>
                      )}
                      {item.type && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                          {item.type}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Tidak ada data ditemukan.
                </div>
              )}
            </div>
          </div>

          {/* Details & Map View */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col h-[650px]">
            <h2 className="font-bold text-lg mb-3 pb-2 border-b border-slate-100">
              Detail & Lokasi Peta
            </h2>

            {selectedItem ? (
              <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h3 className="font-bold text-lg text-blue-900">
                    {selectedItem.name || selectedItem.nama}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedItem.address || selectedItem.alamat || "Alamat tidak tersedia"}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs space-y-1 text-slate-500">
                    <div><strong>Kategori:</strong> {activeTab.toUpperCase()}</div>
                    <div><strong>ID/Kode:</strong> {selectedItem.code || selectedItem.id || "-"}</div>
                  </div>
                </div>

                <div className="flex-1 min-h-[250px] rounded-lg overflow-hidden border border-slate-200">
                  <MapWithNoSSR selectedItem={selectedItem} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-6">
                <span className="text-4xl mb-2">📍</span>
                <p>Klik salah satu item di sebelah kiri untuk melihat detail lengkap dan titik peta lokasi.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Direktori Terpadu Indonesia • Dibangun dengan Next.js & Sumopod API
      </footer>
    </div>
  );
}

function getMockData(type) {
  if (type === "hospital") {
    return [
      { name: "RSUP Dr. Cipto Mangunkusumo", address: "Jl. Diponegoro No.71, Jakarta Pusat", code: "RS001", type: "Kelas A" },
      { name: "RSUD Dr. Soetomo", address: "Jl. Mayjen Prof. Dr. Moestopo No.6-8, Surabaya", code: "RS002", type: "Kelas A" },
      { name: "RSUP Dr. Sardjito", address: "Jl. Kesehatan No.1, Sendowo, Yogyakarta", code: "RS003", type: "Kelas A" },
      { name: "RS Pusat Angkatan Darat Gatot Soebroto", address: "Jl. Dr. Abdul Rachman Saleh No.24, Jakarta Pusat", code: "RS004", type: "Kelas A" },
    ];
  } else if (type === "university") {
    return [
      { name: "Universitas Indonesia (UI)", address: "Depok, Jawa Barat", code: "UI01", type: "PTN" },
      { name: "Universitas Gadjah Mada (UGM)", address: "Bulaksumur, Yogyakarta", code: "UGM02", type: "PTN" },
      { name: "Institut Teknologi Bandung (ITB)", address: "Jl. Ganesha No.10, Bandung", code: "ITB03", type: "PTN" },
      { name: "Institut Pertanian Bogor (IPB)", address: "Dramaga, Bogor", code: "IPB04", type: "PTN" },
    ];
  } else if (type === "school") {
    return [
      { name: "S_MA Negeri 1 Jakarta", address: "Jl. Budi Utomo No.7, Jakarta Pusat", code: "2010101", type: "SMA" },
      { name: "SMA Negeri 3 Bandung", address: "Jl. Belitung No.8, Bandung", code: "2020202", type: "SMA" },
      { name: "SMK Negeri 1 Surabaya", address: "Jl. SMEA No.4, Surabaya", code: "2030303", type: "SMK" },
    ];
  } else {
    return [
      { name: "Provinsi DKI Jakarta", address: "Ibu Kota Negara", code: "31", type: "Provinsi" },
      { name: "Provinsi Jawa Barat", address: "Bandung", code: "32", type: "Provinsi" },
      { name: "Provinsi Jawa Timur", address: "Surabaya", code: "35", type: "Provinsi" },
    ];
  }
}
