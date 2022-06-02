import React from 'react';

export const AboutHeader: React.FunctionComponent = ()=> {
  return (
    <div data-testid='header'>
      <h1 className="mt-5">About Tyko</h1>
      <p>For tracking av projects</p>
    </div>
  );
};


/**
 * Format tyko version information
 * @param {tykoVersion} version running
 * @param {extraData} additional data about configuration
 * @return {JSX.Element}
 * @constructor
 */
interface ExtraData{
    label: string
    data: string
}
interface AboutComponentProps {
    tykoVersion: string
    extraData: ExtraData[]
}
export const AboutComponent: React.FC<AboutComponentProps> = ({extraData, tykoVersion}) =>{
  const extraRows = extraData.map((item: ExtraData)=> {
    return (
      <dl key={item.label} className="row">
        <dt className="col-sm-3">{item.label}</dt>
        <dd className="col-sm-9">{item.data}</dd>
      </dl>
    );
  });
  return (
    <div>
      <AboutHeader/>
      <h2 className="mt-5">Tyko Details</h2>
      <dl className="row">
        <dt className="col-sm-3">Version</dt>
        <dd className="col-sm-9">{tykoVersion}</dd>
      </dl>
      {extraRows}
    </div>
  );
};

export const LoadingComponent: React.FC = ()=> {
  return (
    <div>
      <AboutHeader/>
      <div>Loading...</div>
    </div>
  );
};
