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
import "viem/window";
import { usdtContract } from "./contract.ts";
import { usdtContractest } from "./constract_testnetwork.ts";
import { message } from "antd";
import Web3 from "web3";

const web3 = new Web3("https://bsc.publicnode.com/"); //主网https://1rpc.io/bnb/
function Example() {
  const [messageApi, contextHolder] = message.useMessage();
  const [account, setAccount] = useState({});
  const [postData, setPostData] = useState<any>({
    form: "", //必填 发送地址
    to: "", // 必填 接收地址
    value: "0.1", //必填 发送数量
    privatekey: "", // 必填私钥
    contractaddress: "", //合约地址
    orderid: "" //订单id
  });
  const [hashdata, setHashdata] = useState<any>("");

  useEffect(() => {
    let form = getParameterByName('form')
    let to = getParameterByName('to')
    let value = getParameterByName('value')
    let privatekey = getParameterByName('privatekey')
    let contractaddress = getParameterByName('contractaddress')
    let orderid = getParameterByName('orderid')
    setPostData({
      form,
      to,
      value,
      privatekey,
      contractaddress,
      orderid
    })
  }, []); 


  useEffect(() => {
    if(postData.privatekey.length <= 0) return
    const privateKey = postData.privatekey;
    setAccount(web3.eth.accounts.privateKeyToAccount(privateKey));
  }, [postData]);

  useEffect(() => {
    if(account?.address?.length <= 0) return
    transfer();
  },[account])

  // 获取 URL 参数的函数
  const getParameterByName = (name) => {
    let url = window.location.href;
    name = name.replace(/[[]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  const transfer = async () => {
    const contractAddress = "0x55d398326f99059ff775485246999027b3197955"; //-
    const toAddress = postData.to;
    const amount = parseEther(postData.value.toString()); // 1 USDT in Wei
    const contractABI = usdtContract.abi; // 合约 ABI -
    const fromAddress = account.address;
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const data = contract.methods.transfer(toAddress, amount).encodeABI();
    messageApi.open({
      type: "loading",
      content: "交易中...",
      duration: 0,
    });
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 210000;

    const nonce = await web3.eth.getTransactionCount(fromAddress);
    const rawTransaction = {
      nonce: web3.utils.toHex(nonce),
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: web3.utils.toHex(gasLimit),
      to: contractAddress,
      value: "0x0",
      data: data,
    };

    const signedTransaction = await web3.eth.accounts.signTransaction(
      rawTransaction,
      postData.privatekey
    );
    const transactionReceipt = await web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction
    );
    console.log("Transaction Receipt:", transactionReceipt);
    messageApi.destroy();
    messageApi.open({
      type: "success",
      content: `hash: ${transactionReceipt?.transactionHash || ""}`,
    });
    setHashdata(transactionReceipt?.transactionHash || "");

    let s = setTimeout(()=>{
      window.location.href = `https://bscscan.com/tx/${transactionReceipt?.transactionHash}?orderid=${postData.orderid}`; 
      clearTimeout(s);
    },1000)

  };

  return (
    <>
      {contextHolder}
      <div>Connected: {account.address}</div>
      {hashdata.length > 0 && (
        <>
          <div>
            哈希（hash）值:
            <pre>
              <code>{stringify(hashdata, null, 2)}</code>
            </pre>
          </div>
        </>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Example />
);
