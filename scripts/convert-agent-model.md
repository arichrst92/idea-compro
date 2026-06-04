# Convert Sophia FBX → optimized GLB

File `35-rp_sophia_animated_003_idling_fbx.zip` (~33 MB compressed, ~50 MB extracted) → target `<5 MB` GLB siap web.

---

## Path A — Quick & Simple (online converter)

Bagus untuk test pertama, hasil bisa belum optimal tapi cepat.

1. Extract zip di Mac (double-click)
2. Buka https://anyconv.com/fbx-to-glb-converter/
3. Upload `rp_sophia_animated_003_idling.fbx`
4. Pilih "GLB" sebagai target
5. Wait, download hasil
6. Rename → `agent-model.glb`
7. Replace `public/models/agent-model.glb`
8. Deploy

Catatan: online converter biasanya tidak compress textures. Hasil mungkin masih besar (~15-30 MB). Lanjut Path C (gltfpack) untuk compress.

---

## Path B — Best Quality (Blender headless)

Paling fleksibel. Install Blender sekali, lalu auto-convert + auto-optimize.

```bash
# 1. Install Blender (sekali)
brew install --cask blender

# 2. Extract zip & buka folder
cd ~/Downloads
unzip 35-rp_sophia_animated_003_idling_fbx.zip -d sophia
cd sophia

# 3. Buat script Python untuk Blender
cat > convert.py << 'PYEOF'
import bpy, os, sys

# Clear default scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Import FBX
bpy.ops.import_scene.fbx(
    filepath='rp_sophia_animated_003_idling.fbx',
    use_anim=True,
    automatic_bone_orientation=True,
)

# Resize all textures to max 1024x1024 (saves ~95% size)
for img in bpy.data.images:
    if img.size[0] > 1024 or img.size[1] > 1024:
        img.scale(1024, 1024)

# Export to GLB (binary glTF, embeds everything)
bpy.ops.export_scene.gltf(
    filepath='agent-model.glb',
    export_format='GLB',
    export_animations=True,
    export_skins=True,
    export_morph=True,
    export_image_format='JPEG',
    export_jpeg_quality=82,
    export_yup=True,
)
print("Done → agent-model.glb")
PYEOF

# 4. Run Blender headless
blender --background --python convert.py

# 5. Cek size hasil
ls -lh agent-model.glb
```

Target output: **2-5 MB**. Lanjut ke Path C kalau mau compress lebih.

---

## Path C — Production Optimize (gltfpack)

Compress GLB jadi lebih kecil lagi via Draco mesh compression + KTX2 texture compression.

```bash
# Install gltfpack (sekali)
brew install meshoptimizer

# Optimize the GLB
gltfpack -i agent-model.glb -o agent-model-optimized.glb -cc -tc

# Compare sizes
ls -lh agent-model*.glb
```

Flag `-cc` = mesh compression (Draco), `-tc` = texture compression (BasisU/KTX2). Bisa turunkan 50-80% size lagi.

**Penting:** kalau pakai `-tc`, browser perlu support KTX2 — modern browsers (Chrome 84+, Safari 16+, Firefox 113+) OK. Untuk safety, skip `-tc` dan cukup `-cc` saja.

---

## Pasang ke project & deploy

Setelah punya GLB final yang sudah dioptimasi:

```bash
# Backup model lama (jaga-jaga)
cd "/Users/idea/Library/CloudStorage/OneDrive-IDEAsia/IDEA Company Profile/Source Code/public/models"
mv agent-model.glb agent-model-carolla.glb.bak

# Copy model baru
cp ~/Downloads/sophia/agent-model.glb ./agent-model.glb

# Verify
ls -lh agent-model.glb

# Deploy
cd ../..
./ship.sh "feat: replace agent avatar with Sophia model"
```

Setelah deploy, buka `/agent` di browser, hard refresh, cek:

1. Loader bar progress sampai 100%
2. Avatar muncul, animasi idling jalan otomatis
3. Devtools Network: GLB file < 5 MB
4. Devtools Console: no Three.js error

---

## Penyesuaian camera & lighting (kalau perlu)

Sophia mungkin punya proporsi/skala beda dari Carolla. Kalau avatar terlihat di posisi aneh (terlalu jauh/dekat, kepala di luar frame), edit `public/js/agent.js`:

Baris 123-124 saat ini:
```js
camera.position.set(0, 1.62, 2.6);  // x, y (eye level), z (distance)
camera.lookAt(0, 1.55, 0);          // focus point
```

Tweak `z` (jarak) dan `y` (height) sampai bust shot terlihat pas. Sophia adalah Renderpeople female model, standard height ~1.7m, idle pose berdiri tegak.

Kalau warna avatar terlihat gelap di white bg, naikkan ambient light. Baris 127:
```js
const ambient = new THREE.AmbientLight(0x8899bb, 0.4);  // → ubah 0.4 ke 0.8
```

Kirim screenshot — saya bantu tuning angka spesifik.

---

## Troubleshooting

**"Cannot import FBX"** di Blender → format FBX 2018 tidak fully supported di Blender lama. Update ke Blender 4.x terbaru.

**Animasi tidak jalan setelah load** → cek `gltf.animations.length` di console. Kalau 0, animation tidak ke-import. Re-export dari Blender dengan `export_animations=True`.

**Avatar terlihat hitam/no texture** → texture embed gagal. Buka Blender Scripting workspace, cek mat nodes. Atau gunakan online converter (Path A) yang biasanya handle texture lebih reliable.

**Size masih besar setelah Path B** → tambah `decimate` di Blender script untuk reduce mesh polygons. Atau coba `gltfpack -cc -tc` (Path C).
