import { Buffer } from 'buffer';

export default function decodeAdvertisement(base64Data) {
  if (!base64Data) {
    // console.log("no manufacturer data found!")
    return {
      uuid: null,
      major: null,
      minor: null
    };
  };

  try {
    const data = Buffer.from(base64Data, 'base64');

    if (data.length < 22) {
      return {
        uuid: null,
        major: null,
        minor: null
      };
    }

    const uuidBytes = data.slice(4, 20);

    const uuid = [
      uuidBytes.slice(0, 4).toString('hex'),
      uuidBytes.slice(4, 6).toString('hex'),
      uuidBytes.slice(6, 8).toString('hex'),
      uuidBytes.slice(8, 10).toString('hex'),
      uuidBytes.slice(10, 16).toString('hex'),
    ].join('-');

    const major = data.readUInt16BE(20);
    const minor = data.readUInt16BE(22);

    return {
      uuid,
      major,
      minor,
    };
  } catch (error) {
    console.error(error);
    return {
      uuid: null,
      major: null,
      minor: null
    };
  }
}