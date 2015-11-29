#iptables -t nat -D PREROUTING 3

iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 4000
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

#Block
iptables -I INPUT -s 223.4.0.0/16 -j DROP
iptables -I INPUT -s 150.70.0.0/16 -j DROP
iptables -I INPUT -s 62.210.0.0/16 -j DROP
iptables -I INPUT -s 222.186.0.0/16 -j DROP
iptables -I INPUT -s 185.25.0.0/16 -j DROP

iptables -t nat -L -v -n
