# macOS CI Starter (GitHub Actions)

This bundle gives you:
- `.github/workflows/macos-build.yml`: build DMG/ZIP for x64 & arm64 on GitHub's macOS runners.
- `entitlements.mac.plist` & `entitlements.mac.inherit.plist`: basic hardened runtime entitlements for signing.

## Steps

1. Put these files into your repo (preserve the folder structure).
2. In your `package.json`, add/extend `build` config like:

```jsonc
{
  "name": "seafarnexus-electron",
  "version": "1.0.0",
  "build": {
    "appId": "org.seafar.nexus.desktop",
    "mac": {
      "category": "public.app-category.productivity",
      "hardenedRuntime": true,
      "entitlements": "entitlements.mac.plist",
      "entitlementsInherit": "entitlements.mac.inherit.plist",
      "target": ["dmg", "zip"]
    }
  }
}
```

3. Commit and push. Go to GitHub → Actions → run **macOS build (Electron)**.
4. Download artifacts from the run page.

### Signing / Notarization (optional)

Add repo **Secrets** (Settings → Secrets and variables → Actions → New repository secret):

- `CSC_LINK`: base64 string of your `.p12` "Developer ID Application" certificate (export from Keychain, then base64 encode).
- `CSC_KEY_PASSWORD`: the password you set when exporting the `.p12`.
- `APPLE_TEAM_ID`: your Apple Team ID (10-character code).
- `APPLE_ID`: your Apple Developer account email.
- `APPLE_APP_SPECIFIC_PASSWORD`: generate on https://appleid.apple.com → Sign-In & Security → App-specific passwords.

With these in place, electron-builder will automatically sign and notarize on macOS runners.
If you want an unsigned build temporarily, set `CSC_IDENTITY_AUTO_DISCOVERY=false` in the build step env.
