// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TraceDonate} from "../src/TraceDonate.sol";

contract DeployTraceDonate {
    function run() external returns (TraceDonate) {
        TraceDonate traceDonate = new TraceDonate();
        return traceDonate;
    }
}
