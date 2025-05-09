// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DesignByBid {
    struct Project {
        uint id;
        address owner;
        string description;
        uint budget;
        uint deadline;
        bool active;
        address selectedBidder;
        uint[] milestones;
        bool[] milestonePaid;
        bool disputeRaised;
        uint selectedBidIndex;
    }

    struct Bid {
        uint projectId;
        address bidder;
        uint bidAmount;
        uint completionTime;
        uint[] proposedMilestones;
        bool selected;
    }

    struct Dispute {
        uint projectId;
        address disputant;
        string reason;
        mapping(address => bool) votes;
        uint yesVotes;
        uint noVotes;
        bool resolved;
    }

    uint public projectCount;
    uint public bidCount;
    uint public disputeCount;

    mapping(uint => Project) public projects;
    mapping(uint => Bid[]) public bids;
    mapping(uint => Dispute) public disputes;

    event ProjectPosted(uint projectId, address owner, string description, uint budget, uint deadline);
    event BidSubmitted(uint bidId, uint projectId, address bidder, uint bidAmount, uint completionTime);
    event BidSelected(uint projectId, address selectedBidder);
    event MilestonePaid(uint projectId, uint milestoneIndex);
    event DisputeRaised(uint disputeId, uint projectId, address disputant, string reason);
    event DisputeResolved(uint disputeId, bool result);

    modifier onlyProjectOwner(uint _projectId) {
        require(msg.sender == projects[_projectId].owner, "Only the project owner can perform this action");
        _;
    }

    modifier onlySelectedBidder(uint _projectId) {
        require(msg.sender == projects[_projectId].selectedBidder, "Only the selected bidder can perform this action");
        _;
    }

    // Project owner posts a new project
    function postProject(string memory _description, uint _budget, uint _deadline, uint[] memory _milestones) public {
        require(_milestones.length > 0, "There must be at least one milestone");
        projectCount++;
        projects[projectCount] = Project(projectCount, msg.sender, _description, _budget, _deadline, true, address(0), _milestones, new bool[](_milestones.length), false, 0);
        emit ProjectPosted(projectCount, msg.sender, _description, _budget, _deadline);
    }

    // Contractors submit bids
    function submitBid(uint _projectId, uint _bidAmount, uint _completionTime, uint[] memory _proposedMilestones) public {
        require(projects[_projectId].active, "Project is not active");
        require(_proposedMilestones.length == projects[_projectId].milestones.length, "Milestones count mismatch");

        bidCount++;
        bids[_projectId].push(Bid(_projectId, msg.sender, _bidAmount, _completionTime, _proposedMilestones, false));
        emit BidSubmitted(bidCount, _projectId, msg.sender, _bidAmount, _completionTime);
    }

    // Project owner selects a bid
    function selectBid(uint _projectId, uint _bidIndex) public onlyProjectOwner(_projectId) {
        require(bids[_projectId][_bidIndex].bidder != address(0), "Bid does not exist");
        require(!projects[_projectId].disputeRaised, "Cannot select bid during dispute");

        projects[_projectId].selectedBidder = bids[_projectId][_bidIndex].bidder;
        bids[_projectId][_bidIndex].selected = true;
        projects[_projectId].active = false; // Project is no longer active once a bid is selected
        projects[_projectId].selectedBidIndex = _bidIndex;
        emit BidSelected(_projectId, bids[_projectId][_bidIndex].bidder);
    }

    // Release payment for a milestone
    function releaseMilestonePayment(uint _projectId, uint _milestoneIndex) public onlyProjectOwner(_projectId) {
        require(projects[_projectId].selectedBidder != address(0), "No bid selected");
        require(!projects[_projectId].milestonePaid[_milestoneIndex], "Milestone already paid");
        require(_milestoneIndex < projects[_projectId].milestones.length, "Invalid milestone index");
        require(!projects[_projectId].disputeRaised, "Cannot release payment during dispute");

        uint payment = projects[_projectId].milestones[_milestoneIndex];
        projects[_projectId].milestonePaid[_milestoneIndex] = true;
        (bool success,) = payable(projects[_projectId].selectedBidder).call{value : payment}("");
        require(success, 'Transfer failed');
        emit MilestonePaid(_projectId, _milestoneIndex);
    }

    // Raise a dispute
    function raiseDispute(uint _projectId, string memory _reason) public onlySelectedBidder(_projectId) {
        require(!projects[_projectId].disputeRaised, "Dispute already raised for this project");

        disputeCount++;
        Dispute storage dispute = disputes[disputeCount];
        dispute.projectId = _projectId;
        dispute.disputant = msg.sender;
        dispute.reason = _reason;
        projects[_projectId].disputeRaised = true;
        emit DisputeRaised(disputeCount, _projectId, msg.sender, _reason);
    }

    // Vote on a dispute (by any stakeholder)
    function voteOnDispute(uint _disputeId, bool _vote) public {
        require(!disputes[_disputeId].resolved, "Dispute already resolved");
        require(!disputes[_disputeId].votes[msg.sender], "You have already voted on this dispute");

        disputes[_disputeId].votes[msg.sender] = true;
        if (_vote) {
            disputes[_disputeId].yesVotes++;
        } else {
            disputes[_disputeId].noVotes++;
        }

        // Resolve the dispute if a majority is reached
        if (disputes[_disputeId].yesVotes > disputes[_disputeId].noVotes) {
            disputes[_disputeId].resolved = true;
            _resolveDispute(_disputeId, true);
        } else if (disputes[_disputeId].noVotes > disputes[_disputeId].yesVotes) {
            disputes[_disputeId].resolved = true;
            _resolveDispute(_disputeId, false);
        }
    }

    function _resolveDispute(uint _disputeId, bool result) internal {
        uint projectId = disputes[_disputeId].projectId;
        projects[projectId].disputeRaised = false;
        emit DisputeResolved(_disputeId, result);
    }

    // Fallback function to accept Ether
    receive() external payable {}
}