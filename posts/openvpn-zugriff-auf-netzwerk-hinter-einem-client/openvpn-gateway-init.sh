#!/bin/bash
echo 1 > /proc/sys/net/ipv4/ip_forward
iptables -t nat -F POSTROUTING
iptables -t nat -A POSTROUTING -o eth0 -s 10.8.0.0/24 -j MASQUERADE
