package com.detricon.messenger;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ServiceWorkerController;
import android.webkit.ServiceWorkerWebSettings;
import android.widget.ProgressBar;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "DetriconMessenger";
    private static final int FILE_CHOOSER_RESULT_CODE = 101;
    private ValueCallback<Uri[]> mFilePathCallback;
    private ProgressBar mProgressBar;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        try {
            // Pre-init safety check
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                if (WebView.getCurrentWebViewPackage() == null) {
                    Log.e(TAG, "WebView provider missing! Critical instability likely.");
                }
            }
            super.onCreate(savedInstanceState);
        } catch (Exception e) {
            Log.e(TAG, "Fatal crash during BridgeActivity initialization: " + e.getLocalizedMessage());
            return;
        }

        initializeWebWrapper();
    }

    private void initializeWebWrapper() {
        try {
            // Find progress bar from layout
            mProgressBar = findViewById(R.id.progressBar);

            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                
                configureWebSettings(webView);
                configureWebClients(webView);
                configureServiceWorker();
                
                // Final null check before loading initial URL
                if (webView != null) {
                    Log.d(TAG, "WebView ready for operation.");
                    safeLoadUrl(webView, "https://detricon-messenger.vercel.app/");
                }
            } else {
                Log.e(TAG, "Capacitor bridge or WebView is null.");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error during wrapper initialization: " + e.getLocalizedMessage());
        }
    }

    private void configureWebSettings(WebView webView) {
        try {
            WebSettings settings = webView.getSettings();
            if (settings == null) return;

            // Apply settings one by one with individual safety
            try { settings.setJavaScriptEnabled(true); } catch (Exception e) { Log.w(TAG, "JS failed"); }
            try { settings.setDomStorageEnabled(true); } catch (Exception e) { Log.w(TAG, "DOM Storage failed"); }
            try { settings.setDatabaseEnabled(true); } catch (Exception e) { Log.w(TAG, "IndexedDB failed"); }
            try { settings.setAllowFileAccess(true); } catch (Exception e) { Log.w(TAG, "File access failed"); }
            try { settings.setAllowContentAccess(true); } catch (Exception e) { Log.w(TAG, "Content access failed"); }
            try { settings.setCacheMode(WebSettings.LOAD_DEFAULT); } catch (Exception e) { Log.w(TAG, "Cache mode failed"); }
            try { 
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE); 
            } catch (Exception e) { Log.w(TAG, "Mixed content failed"); }

            // NO AppCache calls here as they are deprecated/crash-prone on SDK 36
        } catch (Exception e) {
            Log.e(TAG, "Massive failure in WebSettings configuration: " + e.getLocalizedMessage());
        }
    }

    private void configureWebClients(final WebView webView) {
        try {
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onProgressChanged(WebView view, int newProgress) {
                    try {
                        if (mProgressBar != null) {
                            if (newProgress == 100) {
                                mProgressBar.setVisibility(View.GONE);
                            } else {
                                if (mProgressBar.getVisibility() == View.GONE) {
                                    mProgressBar.setVisibility(View.VISIBLE);
                                }
                                mProgressBar.setProgress(newProgress);
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Progress bar update failed: " + e.getLocalizedMessage());
                    }
                    super.onProgressChanged(view, newProgress);
                }

                @Override
                public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
                    try {
                        if (mFilePathCallback != null) {
                            mFilePathCallback.onReceiveValue(null);
                        }
                        mFilePathCallback = filePathCallback;

                        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                        intent.addCategory(Intent.CATEGORY_OPENABLE);
                        intent.setType("image/*");

                        Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                        chooserIntent.putExtra(Intent.EXTRA_INTENT, intent);
                        chooserIntent.putExtra(Intent.EXTRA_TITLE, "Upload Profile Image");

                        startActivityForResult(chooserIntent, FILE_CHOOSER_RESULT_CODE);
                        return true;
                    } catch (Exception e) {
                        Log.e(TAG, "File chooser launch failed: " + e.getLocalizedMessage());
                        return false;
                    }
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "WebChromeClient configuration failed: " + e.getLocalizedMessage());
        }
    }

    private void configureServiceWorker() {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                ServiceWorkerController swController = ServiceWorkerController.getInstance();
                if (swController != null) {
                    ServiceWorkerWebSettings swSettings = swController.getServiceWorkerWebSettings();
                    if (swSettings != null) {
                        try { swSettings.setBlockNetworkLoads(false); } catch (Exception e) {}
                        try { swSettings.setCacheMode(WebSettings.LOAD_DEFAULT); } catch (Exception e) {}
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Service Worker not supported or configuration failed: " + e.getLocalizedMessage());
        }
    }

    private void safeLoadUrl(WebView webView, String url) {
        try {
            if (webView != null && url != null) {
                webView.loadUrl(url);
            }
        } catch (Exception e) {
            Log.e(TAG, "safeLoadUrl failed: " + e.getLocalizedMessage());
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        try {
            super.onActivityResult(requestCode, resultCode, data);
            if (requestCode == FILE_CHOOSER_RESULT_CODE) {
                if (mFilePathCallback == null) return;
                Uri[] results = null;
                if (resultCode == RESULT_OK && data != null) {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
                mFilePathCallback.onReceiveValue(results);
                mFilePathCallback = null;
            }
        } catch (Exception e) {
            Log.e(TAG, "onActivityResult failed: " + e.getLocalizedMessage());
        }
    }
}
