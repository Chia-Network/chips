CHIP Number   | < Creator must leave this blank. Editor will assign a number.>
:-------------|:----
Title     	  | Wallet signer QR transportation
Description   | A technique for transporting a QR code between a wallet and a signer
Author    	  | [Matt Hauff](https://github.com/Quexington)
Editor    	  | [Dan Perry](https://github.com/danieljperry)
Comments-URI  | < Creator must leave this blank. Editor will assign a URI.>
Status        | < Creator must leave this blank. Editor will assign a status.>
Category      | Process
Sub-Category  | Tooling
Created   	  | 2024-03-14
Requires   	  | [0027](https://github.com/Chia-Network/chips/pull/102)
Replaces  	  | None
Superseded-By | None

## Abstract

After a wallet has serialized and subdivided a message using the wallet signer protocol, the wallet could transport the resulting BLOB using a communication method that it has pre-established with the signer. However, the wallet signer protocol also allows wallets and signers to use additional standardized transportation methods. This CHIP provides such a method specifically for transporting QR codes.

## Motivation

This CHIP is narrowly focused on QR code transportation. However, more CHIPs could be added as additional needs arise, such as transportation using a third-party service or a push notification.

## Backwards Compatibility

This CHIP does not introduce any backwards incompatibilities.

## Specification

This CHIP uses the python [segno](https://pypi.org/project/segno/) library to make QR codes and rotate them in place every 2 seconds or so. The frequency of rotation is configurable upon running the `segno` command.

## Test Cases

[todo]

## Reference Implementation

[todo]

## Security

CNI plans to conduct an internal audit of this code when it is ready.

## Additional Assets

None

## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
