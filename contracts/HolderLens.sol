// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HolderLens
 * @notice On-chain audit trail and snapshot anchor for HolderLens token analytics on BOT Chain (BOT)
 * @dev Users pay zero protocol fees (only standard network gas).
 */
contract HolderLens {
    struct Snapshot {
        uint256 timestamp;
        uint256 totalHolders;
        uint256 top10ConcentrationBps; // basis points, e.g. 4520 = 45.20%
        bytes32 snapshotHash;          // Hash of top holders data payload
        address recorder;
    }

    struct CheckRecord {
        address user;
        address token;
        uint256 timestamp;
    }

    // Global stats
    uint256 public totalChecks;
    uint256 public totalSnapshotsAnchored;

    // Token => check count
    mapping(address => uint256) public tokenCheckCount;
    // Token => last check timestamp
    mapping(address => uint256) public tokenLastCheckTimestamp;
    // User => Token => check count
    mapping(address => mapping(address => uint256)) public userTokenCheckCount;
    // Token => array of anchored snapshots
    mapping(address => Snapshot[]) private _tokenSnapshots;

    // Events
    event HolderCheckRecorded(
        address indexed user,
        address indexed token,
        uint256 indexed checkId,
        uint256 timestamp
    );

    event SnapshotAnchored(
        address indexed user,
        address indexed token,
        uint256 indexed snapshotIndex,
        uint256 totalHolders,
        uint256 top10ConcentrationBps,
        bytes32 snapshotHash,
        uint256 timestamp
    );

    /**
     * @notice Records an on-chain verification check when a user queries a token's holders.
     * @param token The address of the ERC-20 token being inspected.
     * @return checkId The incremental identifier for this verification check.
     */
    function recordHolderCheck(address token) external returns (uint256 checkId) {
        require(token != address(0), "Invalid token address");

        totalChecks += 1;
        checkId = totalChecks;

        tokenCheckCount[token] += 1;
        tokenLastCheckTimestamp[token] = block.timestamp;
        userTokenCheckCount[msg.sender][token] += 1;

        emit HolderCheckRecorded(msg.sender, token, checkId, block.timestamp);
    }

    /**
     * @notice Anchors a verifiable holder snapshot summary on-chain.
     * @param token Target ERC-20 token address
     * @param totalHolders Discovered holder count at snapshot time
     * @param top10ConcentrationBps Percentage held by top 10 wallets in basis points (10000 = 100%)
     * @param snapshotHash Keccak256 hash or Merkle root of the full holder list snapshot
     */
    function recordSnapshot(
        address token,
        uint256 totalHolders,
        uint256 top10ConcentrationBps,
        bytes32 snapshotHash
    ) external returns (uint256 snapshotIndex) {
        require(token != address(0), "Invalid token address");
        require(top10ConcentrationBps <= 10000, "Bps exceeds 100%");

        Snapshot memory newSnapshot = Snapshot({
            timestamp: block.timestamp,
            totalHolders: totalHolders,
            top10ConcentrationBps: top10ConcentrationBps,
            snapshotHash: snapshotHash,
            recorder: msg.sender
        });

        _tokenSnapshots[token].push(newSnapshot);
        snapshotIndex = _tokenSnapshots[token].length - 1;
        totalSnapshotsAnchored += 1;

        emit SnapshotAnchored(
            msg.sender,
            token,
            snapshotIndex,
            totalHolders,
            top10ConcentrationBps,
            snapshotHash,
            block.timestamp
        );
    }

    /**
     * @notice Get aggregated check metrics for a specific token
     */
    function getTokenStats(address token) external view returns (
        uint256 checkCount,
        uint256 snapshotCount,
        uint256 lastCheckTimestamp
    ) {
        return (
            tokenCheckCount[token],
            _tokenSnapshots[token].length,
            tokenLastCheckTimestamp[token]
        );
    }

    /**
     * @notice Get the most recent snapshot anchored for a token
     */
    function getLatestSnapshot(address token) external view returns (
        bool exists,
        Snapshot memory snapshot
    ) {
        uint256 count = _tokenSnapshots[token].length;
        if (count == 0) {
            return (false, Snapshot(0, 0, 0, bytes32(0), address(0)));
        }
        return (true, _tokenSnapshots[token][count - 1]);
    }

    /**
     * @notice Get all snapshots anchored for a token
     */
    function getSnapshots(address token) external view returns (Snapshot[] memory) {
        return _tokenSnapshots[token];
    }
}
