import { useCallback, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContract, useListings, useListing, useNFT, useAddress } from "@thirdweb-dev/react";
import { Notify } from 'notiflix/build/notiflix-aio';

import { NFTCard } from "../../components/NFTCard";

export default function NFTDetails() {
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const router = useRouter();

  const marketplace = useContract("0x55C8693f7283E565Fe6C83a68E75120fDd54F53F", "marketplace")

  const { data: listings } = useListings(marketplace.contract);
  const listing = useListing(marketplace.contract, Number(router.query.id));

  const { contract } = useContract(listing.data?.assetContractAddress);
  const { data: nft } = useNFT(contract, listing.data?.asset.id)

  const walletAddress = useAddress()
  const userIsNFTOwner = walletAddress && walletAddress === nft?.owner
  const shouldDisableBuyNFTButton = userIsNFTOwner || loadingPurchase || listing.data?.quantity.toString() === '0'

  const handleBuyNFT = useCallback(async () => {
    try {
      setLoadingPurchase(true);

      console.log(listing.data?.id)
      await marketplace.contract.direct.buyoutListing(listing.data?.id, 1)
      Notify.success('You have successfully bought this NFT!')
    } catch (error) {
      Notify.failure('Failed to buy this NFT!')
    } finally {
      setLoadingPurchase(false)
    }
  }, [listing]);

  return (
    <div className="px-[10%] min-h-[80vh]">
      <Head>
        <title>{listing.data?.asset.name} - Detail Page</title>
      </Head>

      <div className="mt-24 flex flex-wrap gap-10">
        <img className="rounded-[1.25rem] w-full max-w-xl h-auto" src={listing.data?.asset.image} alt={listing.data?.asset.name.toString()} />

        <div className="ml-10 w-full max-w-sm">
          <h1 className="text-5xl font-bold">{listing.data?.asset.name}</h1>
          <p className="text=[#93989A] mt-4">{listing.data?.asset.description}</p>

          <hr className="w-full border-[#242634] mt-8 mb-4" />

          <div>
            <p className="text-[#93989A]">Owner</p>
            <p>{nft?.owner?.slice(0, 6)} {userIsNFTOwner && '(You)'}</p>
          </div>

          <hr className="w-full border-[#242634] mt-4 mb-8" />

          <div>
            <button
              onClick={handleBuyNFT}
              disabled={shouldDisableBuyNFTButton}
              className={`bg-[#ff2748] py-[1rem] px-6 rounded-xl ${shouldDisableBuyNFTButton ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
            >
              {loadingPurchase ? 'loading...' : 'Buy NFT'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-24">
        <h2 className="text-4xl mt-24">More Works</h2>
        <div className="flex flex-wrap items-start gap-16 mt-7">
          {listings?.filter((_listing, index) => index < 3).map((listing) => (
            <NFTCard listing={listing} key={listing.id} />
          ))}
        </div>
      </div>
    </div>
  )
}