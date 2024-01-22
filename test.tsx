import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  http,
  Address,
  Hash,
  TransactionReceipt,
  createPublicClient,
  createWalletClient,
  custom,
  stringify,
  parseEther,
} from "viem";
import { bscTestnet } from "viem/chains";
import "viem/window";
import { usdtContract } from "./contractbusd2.ts";
import { privateKeyToAccount } from 'viem/accounts'
import { message } from "antd";

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(),
});

const accounts = privateKeyToAccount("0x570cc07a5af78943e696613084ac706d6c32c0fc5b1d8a1ace20b44508f3b6f2");
const walletClient = createWalletClient({
  account: accounts,
  chain: bscTestnet,
  transport: custom(window.ethereum!),
});


function Example() {
  // const [account, setAccount] = useState<Address>();
  const [hash, setHash] = useState<Hash>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [messageApi, contextHolder] = message.useMessage();
  const [postData, setPostData] = useState({
    chainid: null,
    contractaddress: null,
    value: "0.1",
    data: null,
  });

  useEffect(() => {
    (async()=>{
      let data = await fetch("/api/1/1.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      // setPostData(data.data)
    })()
  }, []);



  const transfer = async () => {
    if (!accounts) return;
    const { request } = await publicClient.simulateContract({
      ...usdtContract,
      functionName: "transfer",
      args: ["0x345b98196b80d58a4ff4a650631917ca28fa4246", parseEther(postData?.value.toString() || "0")],
      account: accounts,
      chain: bscTestnet,
    });
    const signature = await accounts.signTransaction({
      to: '0x345b98196b80d58a4ff4a650631917ca28fa4246',
      data: request,
    })
    const hash = await walletClient.writeContract(request);
    setHash(hash);
    messageApi.open({
      type: "loading",
      content: "交易中...",
      duration: 0,
    });
  };

  useEffect(() => {
    (async () => {
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        messageApi.destroy();
        if(receipt.status == "success") {
          setReceipt(receipt.transactionHash);
          messageApi.open({
            type: "success",
            content: "交易成功",
          });
        }else {
          messageApi.open({
            type: "error",
            content: "交易失败",
          });
        }
      }
    })();
  }, [hash]);

    return (
      <>
        {contextHolder}
        <div>Connected: {accounts.address}</div>
        <button onClick={()=> transfer()}>transfer</button>
        {receipt && (
          <>
            <div>
              Receipt:
              <pre>
                <code>{stringify(receipt, null, 2)}</code>
              </pre>
            </div>
          </>
        )}
      </>
    )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Example />
);
