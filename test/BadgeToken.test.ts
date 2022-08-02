import {expect} from "chai";
import { Signer } from "ethers";
import {ethers} from "hardhat";
import { BadgeToken } from "../typechain-types";

const base64 = require("base-64");

const NAME = "BadgeToken";
const SYMBOL = "BADGE";

describe("BadgeToken",function() {
    let badge:BadgeToken;
    let account0:Signer,account1:Signer;

    beforeEach(async function (){
        [account0,account1] = await ethers.getSigners()
        const BadgeToken = await ethers.getContractFactory('BadgeToken')
        badge = await BadgeToken.deploy(NAME,SYMBOL)
    })
    

    it('Should has current name and symbol',async ()=>{
        expect(await badge.name()).to.equal(NAME)
        expect(await badge.symbol()).to.equal(SYMBOL)
    })

    it("Should tokenId start from 1 and auto increment",async function(){
        const address1 = await account1.getAddress();
        await badge.mintTo(address1);
        expect(await badge.ownerOf(1)).to.equal(address1)

        await badge.mintTo(address1)
        expect(await badge.ownerOf(2)).to.equal(address1)
        expect(await badge.balanceOf(address1)).to.equal(2)
    })
    it("Should mint a token with event",async function (){
        const address1 = await account1.getAddress();
        await expect(badge.mintTo(address1))
        .to.emit(badge,"Transfer")
        .withArgs(ethers.constants.AddressZero,address1,1)
    })

    it("Should mint a token with desired tokenURI (log result for inspection)", async function () {
        const address1 = await account1.getAddress()
        await badge.mintTo(address1)

        const tokenURI = await badge.tokenURI(1)

        const tokenId = 1;
        const data = base64.decode(tokenURI.slice(29))
        const itemInfo = JSON.parse(data)
        expect(itemInfo.name).to.be.equal('Badge #'+String(tokenId))
        expect(itemInfo.description).to.be.equal('Badge NFT with on-chain SVG image.')

        const svg = base64.decode(itemInfo.image.slice(26))
        const idInSVG = svg.slice(256,-13)
        expect(idInSVG).to.be.equal(String(tokenId))
    })

    it("Should mint 10 token with desired tokenURI", async function () {
        const address1=await account1.getAddress()
     
        for(let i=1;i<=10;i++){
          await badge.mintTo(address1)
          const tokenUri = await badge.tokenURI(i)
    
          const data = base64.decode(tokenUri.slice(29))
          const itemInfo = JSON.parse(data)
          expect(itemInfo.name).to.be.equal('Badge #'+String(i))
          expect(itemInfo.description).to.be.equal('Badge NFT with on-chain SVG image.')
    
          const svg = base64.decode(itemInfo.image.slice(26))
          const idInSVG = svg.slice(256,-13)
          expect(idInSVG).to.be.equal(String(i))
        }
    
        expect(await badge.balanceOf(address1)).to.equal(10)
    }) 

    


})