#!/bin/bash
LOCAL=/var/data/cloud/
REMOTE=https://mein.server.de/remote.php/webdav/
PARAMS="--non-interactive -n --exclude /home/pi/nextcloudcmd-sync-exclude.txt"

LOG=/var/log/nextcloudcmd-sync.log

PATH=$PATH:/usr/bin:/usr/local/bin

(
  if [ `pgrep -x nextcloudcmd` ]; then
    echo "===================="
    date -R
    echo "Cloud-Sync läuft schon!"
    echo "===================="
    exit 1
  fi

  echo "===================="
  date -R
  echo "Cloud-Sync gestartet"
  echo "===================="

  nextcloudcmd $PARAMS $LOCAL $REMOTE

  echo "===================="
  date -R
  echo "Cloud-Sync beendet"
  echo "===================="
) 2>&1 | tee -a $LOG
