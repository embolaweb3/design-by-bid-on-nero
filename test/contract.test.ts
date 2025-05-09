import { expect } from 'chai';
import { Wallet } from 'ethers';
import { ethers } from 'hardhat';

describe("DesignByBid Contract", function () {
    let contract: any;
    let owner: Wallet;
    let bidder1: Wallet;
    let bidder2: Wallet;
    const milestones = [ethers.parseEther("1.0"), ethers.parseEther("2.0")];

    before(async function () {
        [owner, bidder1, bidder2] = await (ethers as any).getSigners();

        const contract_factory = await ethers.getContractFactory("DesignByBid");
        contract = contract_factory.deploy()
        await contract.waitForDeployment()
    });

    it("Should post a project", async function () {
        const tx = await contract.connect(owner).postProject("Project 1", ethers.parseEther("3.0"), 30, milestones);
        const receipt = await tx.wait();
        
        const event = receipt.logs.find((log: any) => 
            contract.interface.parseLog(log)?.name === "ProjectPosted"
        );
        
        expect(event).to.not.be.undefined;
        
        const parsedEvent = contract.interface.parseLog(event!);
        const args = parsedEvent!.args;

        expect(args[0]).to.exist; // projectId
        expect(args[1]).to.equal(owner.address);
        expect(args[2]).to.equal("Project 1");
        expect(args[3]).to.equal(ethers.parseEther("3.0"));
        expect(args[4].toString()).to.equal('30');
    });

    it("Should allow a contractor to submit a bid", async function () {
        const bidAmount = ethers.parseEther("3.0");
        const proposedMilestones = [ethers.parseEther("1.0"), ethers.parseEther("2.0")];

        const tx = await contract.connect(bidder1).submitBid(1, bidAmount, 15, proposedMilestones);
        const receipt = await tx.wait();

        const event = receipt.logs.find((log: any) => 
            contract.interface.parseLog(log)?.name === "BidSubmitted"
        );

        expect(event).to.not.be.undefined;
        const parsedEvent = contract.interface.parseLog(event!);
        expect(parsedEvent.args[2]).to.equal(bidder1.address);
    });

    it("Should allow the owner to select a bid", async function () {
        const tx = await contract.connect(owner).selectBid(1, 0);
        const receipt = await tx.wait();

        const event = receipt.logs.find((log: any) => 
            contract.interface.parseLog(log)?.name === "BidSelected"
        );

        expect(event).to.not.be.undefined;
        const parsedEvent = contract.interface.parseLog(event!);
        expect(parsedEvent.args[1]).to.equal(bidder1.address);
    });

    it("Should allow the owner to release milestone payments", async function () {
        await owner.sendTransaction({
            to: await contract.getAddress(),
            value: ethers.parseEther("3.0")
        });

        const tx = await contract.connect(owner).releaseMilestonePayment(1, 0);
        const receipt = await tx.wait();

        const event = receipt.logs.find((log: any) => 
            contract.interface.parseLog(log)?.name === "MilestonePaid"
        );
        expect(event).to.not.be.undefined;
    });

    it("Should allow the bidder to raise a dispute", async function () {
        const tx = await contract.connect(bidder1).raiseDispute(1, "Milestone not met");
        const receipt = await tx.wait();

        const event = receipt.logs.find((log: any) => 
            contract.interface.parseLog(log)?.name === "DisputeRaised"
        );

        expect(event).to.not.be.undefined;
        const parsedEvent = contract.interface.parseLog(event!);
        expect(parsedEvent.args[2]).to.equal(bidder1.address);
    });

    it("Should allow stakeholders to vote on a dispute", async function () {
        const disputeId = 1;

        const txYes = await contract.connect(owner).voteOnDispute(disputeId, true);
        await txYes.wait();

        const dispute = await contract.disputes(disputeId);
        expect(dispute.resolved).to.be.true;
    });
});