# GraviStudio

A real installable VSIX dashboard for the GraviStudio Antigravity AI Video Studio.

After installation, click the **GraviStudio** icon in the Activity Bar and choose **Initialize Studio**. The extension installs its bundled Antigravity skills, verifies the local toolchain, and can download optional open-source engines only when you request them.

## Included video workspaces

- Product Video — `/brag` + HyperFrames routing
- Motion Graphics — HyperFrames / web animation / FFmpeg
- Website → Video
- Auto Shorts — AutoClip / SupoClip routing
- AI Director — OpenMontage routing
- Live Avatar — PersonaLive experimental routing
- Video Editor — FFmpeg
- Reel Maker — mixed supplied/autonomous assets

## Initialize Studio

Initialization is idempotent. Existing skills are verified and left intact; missing bundled GraviStudio skills are copied into the configured Antigravity skills directory. Optional engines are installed separately from the dashboard.

The extension never enables paid providers automatically and never uses permission-bypass flags.
