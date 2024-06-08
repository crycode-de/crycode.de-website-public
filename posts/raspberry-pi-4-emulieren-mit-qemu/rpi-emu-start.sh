#!/bin/bash
IMAGE=disk.img    # Image
CPU_CORES=4       # CPU-Kerne (bis zu 8)
RAM_SIZE=8G       # Größe des Arbeitsspeichers
SSH_PORT=2222     # Lokaler Port für den SSH-Zugriff
MONITOR_PORT=5555 # Lokaler Port für die QEMU Monitor Konsole
ARGS=             # Zusätzliche Argument (-nographic um ohne grafisches Fenster zu starten)

qemu-system-aarch64 -machine virt -cpu cortex-a72 \
  -smp ${CPU_CORES} -m ${RAM_SIZE} \
  -kernel kernel \
  -append "root=/dev/vda2 rootfstype=ext4 rw panic=0 console=ttyAMA0" \
  -drive format=raw,file=${IMAGE},if=none,id=hd0,cache=writeback \
  -device virtio-blk,drive=hd0,bootindex=0 \
  -netdev user,id=mynet,hostfwd=tcp::${SSH_PORT}-:22 \
  -device virtio-net-pci,netdev=mynet \
  -monitor telnet:127.0.0.1:${MONITOR_PORT},server,nowait \
  $ARGS
