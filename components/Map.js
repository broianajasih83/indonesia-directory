import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function Map({ selectedItem }) {
  useEffect(() => {
    const map = L.map("map", {
      center: [-2.5489, 118.0149], // Center of Indonesia
      zoom: 5,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    if (selectedItem) {
      // Mock coordinates for demo items or generic location
      const lat = selectedItem.lat || -6.2088;
      const lng = selectedItem.lng || 106.8456;
      map.setView([lat, lng], 14);
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${selectedItem.name || selectedItem.nama}</b><br/>${selectedItem.address || selectedItem.alamat || ""}`)
        .openPopup();
    }

    return () => {
      map.remove();
    };
  }, [selectedItem]);

  return <div id="map" className="w-full h-full rounded-lg z-0" />;
}
