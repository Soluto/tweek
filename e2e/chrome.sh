#!/bin/bash

function install_chrome_browser() {
    echo '>>> Installing Chrome'

    local url="https://s3.amazonaws.com/circle-downloads/google-chrome-stable_54.0.2840.100-1_amd64.deb"
    local deb_path="/tmp/google-chrome.deb"

    curl --output $deb_path $url

    dpkg -i $deb_path || apt-get -f install

    # Disable sandboxing - it conflicts with unprivileged lxc containers
    sed -i 's|HERE/chrome"|HERE/chrome" --disable-setuid-sandbox --enable-logging --no-sandbox|g' \
               "/opt/google/chrome/google-chrome"
}


# Chrome Driver

function install_chromedriver() {
    CHROME_DRIVER_VERSION=2.27
    curl -L -o /tmp/chromedriver.zip http://chromedriver.storage.googleapis.com/${CHROME_DRIVER_VERSION}/chromedriver_linux64.zip
    unzip -p /tmp/chromedriver.zip > /usr/local/bin/chromedriver
    chmod +x /usr/local/bin/chromedriver
    rm -rf /tmp/chromedriver.zip
}

function install_chrome() {
    install_chrome_browser
    install_chromedriver
}
