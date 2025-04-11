import RecipeForm from '../components/RecipeForm';

const CreateRecipePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Create Your Recipe NFT
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Share your culinary heritage with the world. Your recipe will be preserved on the blockchain
            and stored on IPFS for permanent access.
          </p>
        </div>
        
        <RecipeForm />
        
        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">About Recipe NFTs</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              By creating a recipe NFT, you're contributing to a global, decentralized archive of culinary knowledge.
              Each recipe is stored on IPFS (InterPlanetary File System) and minted as an NFT on the blockchain.
            </p>
            <p>
              This ensures that your recipe:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Is permanently preserved and cannot be altered</li>
              <li>Has verifiable attribution to you as the creator</li>
              <li>Remains accessible even if this platform disappears</li>
              <li>Contributes to the preservation of global culinary heritage</li>
            </ul>
            <p>
              RecipeVerse is committed to respecting cultural heritage. Please provide proper attribution
              for traditional recipes and respect the origins of culinary traditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipePage; 