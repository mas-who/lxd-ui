import { LxdNetwork } from "types/network";

export const getNetworkEditValues = (network: LxdNetwork) => {
  return {
    name: network.name,
    description: network.description,
    type: network.type,
    bridge_driver: network.config["bridge.driver"],
    bridge_hwaddr: network.config["bridge.hwaddr"],
    bridge_mode: network.config["bridge.mode"],
    bridge_mtu: network.config["bridge.mtu"],
    dns_domain: network.config["dns.domain"],
    dns_mode: network.config["dns.mode"],
    dns_search: network.config["dns.search"],
    dns_zone_forward: network.config["dns.zone.forward"],
    dns_zone_reverse_ipv4: network.config["dns.zone.reverse.ipv4"],
    dns_zone_reverse_ipv6: network.config["dns.zone.reverse.ipv6"],
    fan_type: network.config["fan.type"],
    fan_overlay_subnet: network.config["fan.overlay_subnet"],
    fan_underlay_subnet: network.config["fan.underlay_subnet"],
    ipv4_address: network.config["ipv4.address"],
    ipv4_dhcp:
      network.config["ipv4.dhcp"] !== undefined
        ? Boolean(network.config["ipv4.dhcp"])
        : undefined,
    ipv4_dhcp_expiry: network.config["ipv4.dhcp.expiry"],
    ipv4_dhcp_ranges: network.config["ipv4.dhcp.ranges"],
    ipv4_l3only:
      network.config["ipv4.l3only"] !== undefined
        ? Boolean(network.config["ipv4.l3only"])
        : undefined,
    ipv4_nat:
      network.config["ipv4.nat"] !== undefined
        ? Boolean(network.config["ipv4.nat"])
        : undefined,
    ipv4_nat_address: network.config["ipv4.nat.address"],
    ipv4_nat_order: network.config["ipv4.nat.order"],
    ipv4_ovn_ranges: network.config["ipv4.ovn.ranges"],
    ipv6_address: network.config["ipv6.address"],
    ipv6_dhcp:
      network.config["ipv6.dhcp"] !== undefined
        ? Boolean(network.config["ipv6.dhcp"])
        : undefined,
    ipv6_dhcp_expiry: network.config["ipv6.dhcp.expiry"],
    ipv6_dhcp_ranges: network.config["ipv6.dhcp.ranges"],
    ipv6_dhcp_stateful:
      network.config["ipv6.dhcp.stateful"] !== undefined
        ? Boolean(network.config["ipv6.dhcp.stateful"])
        : undefined,
    ipv6_l3only:
      network.config["ipv6.l3only"] !== undefined
        ? Boolean(network.config["ipv6.l3only"])
        : undefined,
    ipv6_nat:
      network.config["ipv6.nat"] !== undefined
        ? Boolean(network.config["ipv6.nat"])
        : undefined,
    ipv6_nat_address: network.config["ipv6.nat.address"],
    ipv6_nat_order: network.config["ipv6.nat.order"],
    ipv6_ovn_ranges: network.config["ipv6.ovn.ranges"],
    network: network.config.network,
  };
};

export const handleConfigKeys = [
  "bridge.driver",
  "bridge.external_interfaces",
  "bridge.hwaddr",
  "bridge.mode",
  "bridge.mtu",
  "dns.domain",
  "dns.mode",
  "dns.search",
  "dns.zone.forward",
  "dns.zone.reverse.ipv4",
  "dns.zone.reverse.ipv6",
  "fan.type",
  "fan.overlay_subnet",
  "fan.underlay_subnet",
  "ipv4.address",
  "ipv4.dhcp",
  "ipv4.dhcp.expiry",
  "ipv4.dhcp.gateway",
  "ipv4.dhcp.ranges",
  "ipv4.firewall",
  "ipv4.l3only",
  "ipv4.nat",
  "ipv4.nat.address",
  "ipv4.nat.order",
  "ipv4.ovn.ranges",
  "ipv4.routes",
  "ipv4.routing",
  "ipv6.address",
  "ipv6.dhcp",
  "ipv6.dhcpexpiry",
  "ipv6.dhcp.ranges",
  "ipv6.dhcp.stateful",
  "ipv6.firewall",
  "ipv6.l3only",
  "ipv6.nat",
  "ipv6.nat.address",
  "ipv6.nat.order",
  "ipv6.ovn.ranges",
  "ipv6.routes",
  "ipv6.routing",
  "network",
];
