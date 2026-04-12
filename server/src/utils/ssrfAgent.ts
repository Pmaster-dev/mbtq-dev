import http from 'http';
import https from 'https';
import dns from 'dns';
import ipaddr from 'ipaddr.js';

const isInternalIp = (ipStr: string): boolean => {
  try {
    if (ipStr.startsWith('::ffff:')) {
      ipStr = ipStr.substring(7);
    }

    if (!ipaddr.isValid(ipStr)) {
      return false;
    }

    const ip = ipaddr.parse(ipStr);
    const range = ip.range();

    // Block typical internal network ranges
    return [
      'private',
      'loopback',
      'linkLocal',
      'unspecified',
      'multicast',
      'broadcast'
    ].includes(range);
  } catch (e) {
    // If we can't parse it, better block it
    return true;
  }
};

const checkIp = (ipStr: string): Error | null => {
  if (isInternalIp(ipStr)) {
    return new Error(`Blocked internal IP: ${ipStr}`);
  }
  return null;
};

export class SsrfHttpAgent extends http.Agent {
  createConnection(options: any, callback?: any) {
    if (options.host && ipaddr.isValid(options.host)) {
      const err = checkIp(options.host);
      if (err) {
         if (callback) return callback(err);
         throw err;
      }
    }

    options.lookup = (hostname: string, opts: any, cb: any) => {
      let resolvedCb = cb || opts;
      let resolvedOpts = cb ? opts : {};

      if (ipaddr.isValid(hostname)) {
        const err = checkIp(hostname);
        if (err) return resolvedCb(err);
        return resolvedCb(null, hostname, ipaddr.parse(hostname).kind() === 'ipv4' ? 4 : 6);
      }

      dns.lookup(hostname, resolvedOpts, (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family: number) => {
        if (err) return resolvedCb(err);
        let ipStr = typeof address === 'string' ? address : address[0].address;
        const ipErr = checkIp(ipStr);
        if (ipErr) return resolvedCb(ipErr);
        resolvedCb(null, address, family);
      });
    };

    return super.createConnection(options, callback);
  }
}

export class SsrfHttpsAgent extends https.Agent {
  createConnection(options: any, callback?: any) {
    if (options.host && ipaddr.isValid(options.host)) {
      const err = checkIp(options.host);
      if (err) {
         if (callback) return callback(err);
         throw err;
      }
    }

    options.lookup = (hostname: string, opts: any, cb: any) => {
      let resolvedCb = cb || opts;
      let resolvedOpts = cb ? opts : {};

      if (ipaddr.isValid(hostname)) {
        const err = checkIp(hostname);
        if (err) return resolvedCb(err);
        return resolvedCb(null, hostname, ipaddr.parse(hostname).kind() === 'ipv4' ? 4 : 6);
      }

      dns.lookup(hostname, resolvedOpts, (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family: number) => {
        if (err) return resolvedCb(err);
        let ipStr = typeof address === 'string' ? address : address[0].address;
        const ipErr = checkIp(ipStr);
        if (ipErr) return resolvedCb(ipErr);
        resolvedCb(null, address, family);
      });
    };

    return super.createConnection(options, callback);
  }
}
