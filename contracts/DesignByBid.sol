// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DesignByBid {

    // Struct to represent a project
    struct Project {
        uint id;
        address owner;
        string description;
        uint budget;
        uint deadline;
        bool active; // Indicates if the project is active
        address selectedBidder; // Address of the selected bidder
        uint[] milestones; // Array of milestone amounts
        bool[] milestonePaid; // Tracks if each milestone is paid
        bool disputeRaised; // Indicates if a dispute is raised
        uint selectedBidIndex; // Index of the selected bid
    }

    // Struct to represent a bid
    struct Bid {
        uint projectId;
        address bidder;
        uint bidAmount;
        uint completionTime; // Proposed completion time by the bidder
        uint[] proposedMilestones; // Milestones proposed by the bidder
        bool selected; // Indicates if the bid is selected
    }

    // Struct to represent a dispute
    struct Dispute {
        uint projectId;
        address disputant;
        string reason;
        mapping(address => bool) votes; // Mapping to track votes on the dispute
        uint yesVotes; // Count of yes votes
        uint noVotes; // Count of no votes
        bool resolved; // Indicates if the dispute is resolved
    }

    // State variables to track counts and mappings
    uint public projectCount;
    uint public bidCount;
    uint public disputeCount;

    mapping(uint => Project) public projects; // Maps project ID to Project struct
    mapping(uint => Bid[]) public bids; // Maps project ID to an array of bids
    mapping(uint => Dispute) public disputes; // Maps dispute ID to Dispute struct

    // Events to log significant actions
    event ProjectPosted(uint projectId, address owner, string description, uint budget, uint deadline);
    event BidSubmitted(uint bidId, uint projectId, address bidder, uint bidAmount, uint completionTime);
    event BidSelected(uint projectId, address selectedBidder);
    event MilestonePaid(uint projectId, uint milestoneIndex);
    event DisputeRaised(uint disputeId, uint projectId, address disputant, string reason);
    event DisputeResolved(uint disputeId, bool result);

    // Modifier to restrict access to only the project owner
    modifier onlyProjectOwner(uint _projectId) {
        require(msg.sender == projects[_projectId].owner, "Only the project owner can perform this action");
        _;
    }

    // Modifier to restrict access to only the selected bidder
    modifier onlySelectedBidder(uint _projectId) {
        require(msg.sender == projects[_projectId].selectedBidder, "Only the selected bidder can perform this action");
        _;
    }

    // Function for the project owner to post a new project
    function postProject(string memory _description, uint _budget, uint _deadline, uint[] memory _milestones) public {
        require(_milestones.length > 0, "There must be at least one milestone");
        projectCount++;
        projects[projectCount] = Project(projectCount, msg.sender, _description, _budget, _deadline, true, address(0), _milestones, new bool[](_milestones.length), false, 0);
        emit ProjectPosted(projectCount, msg.sender, _description, _budget, _deadline);
    }

    // Function for contractors to submit bids for a project
    function submitBid(uint _projectId, uint _bidAmount, uint _completionTime, uint[] memory _proposedMilestones) public {
        require(projects[_projectId].active, "Project is not active");
        require(_proposedMilestones.length == projects[_projectId].milestones.length, "Milestones count mismatch");

        bidCount++;
        bids[_projectId].push(Bid(_projectId, msg.sender, _bidAmount, _completionTime, _proposedMilestones, false));
        emit BidSubmitted(bidCount, _projectId, msg.sender, _bidAmount, _completionTime);
    }

    // Function for the project owner to select a bid
    function selectBid(uint _projectId, uint _bidIndex) public onlyProjectOwner(_projectId) {
        require(bids[_projectId][_bidIndex].bidder != address(0), "Bid does not exist");
        require(!projects[_projectId].disputeRaised, "Cannot select bid during dispute");

        projects[_projectId].selectedBidder = bids[_projectId][_bidIndex].bidder;
        bids[_projectId][_bidIndex].selected = true;
        projects[_projectId].active = false; // Project becomes inactive after a bid is selected
        projects[_projectId].selectedBidIndex = _bidIndex;
        emit BidSelected(_projectId, bids[_projectId][_bidIndex].bidder);
    }

    // Function to release payment for a specific milestone
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

    // Function for the selected bidder to raise a dispute
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

    // Function for stakeholders to vote on a dispute
    function voteOnDispute(uint _disputeId, bool _vote) public {
        require(!disputes[_disputeId].resolved, "Dispute already resolved");
        require(!disputes[_disputeId].votes[msg.sender], "You have already voted on this dispute");

        disputes[_disputeId].votes[msg.sender] = true;
        if (_vote) {
            disputes[_disputeId].yesVotes++;
        } else {
            disputes[_disputeId].noVotes++;
        }

        // Resolve the dispute if a majority vote is reached
        if (disputes[_disputeId].yesVotes > disputes[_disputeId].noVotes) {
            disputes[_disputeId].resolved = true;
            _resolveDispute(_disputeId, true);
        } else if (disputes[_disputeId].noVotes > disputes[_disputeId].yesVotes) {
            disputes[_disputeId].resolved = true;
            _resolveDispute(_disputeId, false);
        }
    }

    // Internal function to handle dispute resolution
    function _resolveDispute(uint _disputeId, bool result) internal {
        uint projectId = disputes[_disputeId].projectId;
        projects[projectId].disputeRaised = false;
        emit DisputeResolved(_disputeId, result);
    }

    // Function to fetch all projects
    function fetchProjects() public view returns (Project[] memory) {
        Project[] memory allProjects = new Project[](projectCount);
        for (uint i = 1; i <= projectCount; i++) {
            allProjects[i - 1] = projects[i];
        }
        return allProjects;
    }

    // Function for the project owner to withdraw unspent funds
    function withdrawUnspentFunds(uint _projectId) public onlyProjectOwner(_projectId) {
        require(!projects[_projectId].active, "Project is still active");
        require(!projects[_projectId].disputeRaised, "Cannot withdraw during a dispute");

        uint unspentAmount = address(this).balance;
        for (uint i = 0; i < projects[_projectId].milestones.length; i++) {
            if (!projects[_projectId].milestonePaid[i]) {
                unspentAmount -= projects[_projectId].milestones[i];
            }
        }

        require(unspentAmount > 0, "No unspent funds available");
        (bool success,) = payable(projects[_projectId].owner).call{value: unspentAmount}("");
        require(success, "Withdrawal failed");
    }

    // Function to allow the project owner to cancel a project
    function cancelProject(uint _projectId) public onlyProjectOwner(_projectId) {
        require(projects[_projectId].active, "Project is not active or already completed");
        require(projects[_projectId].selectedBidder == address(0), "Cannot cancel after a bid has been selected");

        projects[_projectId].active = false;

        // Refund all bidders
        for (uint i = 0; i < bids[_projectId].length; i++) {
            (bool success,) = payable(bids[_projectId][i].bidder).call{value: bids[_projectId][i].bidAmount}("");
            require(success, "Refund failed");
        }
    }

    // Function to allow the project owner to update project details
    function updateProject(uint _projectId, string memory _description, uint _budget, uint _deadline, uint[] memory _milestones) public onlyProjectOwner(_projectId) {
        require(projects[_projectId].active, "Project is not active");
        require(projects[_projectId].selectedBidder == address(0), "Cannot update after a bid has been selected");

        projects[_projectId].description = _description;
        projects[_projectId].budget = _budget;
        projects[_projectId].deadline = _deadline;
        projects[_projectId].milestones = _milestones;
        projects[_projectId].milestonePaid = new bool[](_milestones.length);
    }

    // Function to extend the project deadline
    function extendDeadline(uint _projectId, uint _newDeadline) public {
        require(msg.sender == projects[_projectId].owner || msg.sender == projects[_projectId].selectedBidder, "Only project owner or selected bidder can extend the deadline");
        require(_newDeadline > projects[_projectId].deadline, "New deadline must be later than the current deadline");
        require(!projects[_projectId].disputeRaised, "Cannot extend deadline during dispute");

        projects[_projectId].deadline = _newDeadline;
    }

    // Function to penalize the selected bidder for missing the deadline
    function penalizeBidder(uint _projectId) public onlyProjectOwner(_projectId) {
        require(projects[_projectId].selectedBidder != address(0), "No bidder selected");
        require(block.timestamp > projects[_projectId].deadline, "Deadline not yet reached");
        require(!projects[_projectId].milestonePaid[projects[_projectId].milestones.length - 1], "All milestones already paid");

        uint penalty = projects[_projectId].budget / 10; // Example: 10% penalty
        projects[_projectId].milestones[projects[_projectId].milestones.length - 1] -= penalty;

        (bool success,) = payable(projects[_projectId].owner).call{value: penalty}("");
        require(success, "Penalty transfer failed");
    }

    // Fallback function to accept Ether
    receive() external payable {}
}