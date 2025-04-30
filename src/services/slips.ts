import { supabase } from '../lib/supabase';
import { cleanPayload } from '../utils/cleanPayload';
import type { TransportSlip, FreightSlip, SlipStatus } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function createTransportSlip(data: Omit<TransportSlip, 'id' | 'number' | 'created_at' | 'updated_at'>): Promise<TransportSlip> {
  const number = await getNextSlipNumber('transport');
  
  const payload = cleanPayload({
    ...data,
    number
  });

  console.log('🚨 Cleaned data being sent to Supabase (transport):', payload);

  const { data: slip, error } = await supabase
    .from('transport_slips')
    .insert([payload])
    .select(`
      id,
      number,
      status,
      client_id,
      client:client_id(nom),
      vehicule_id,
      vehicule:vehicule_id(immatriculation),
      loading_date,
      loading_time,
      loading_time_start,
      loading_time_end,
      loading_address,
      loading_contact,
      delivery_date,
      delivery_time,
      delivery_time_start,
      delivery_time_end,
      delivery_address,
      delivery_contact,
      goods_description,
      volume,
      weight,
      vehicle_type,
      custom_vehicle_type,
      exchange_type,
      instructions,
      price,
      payment_method,
      observations,
      photo_required,
      documents,
      order_number,
      tailgate,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw new Error(`Error creating transport slip: ${error.message}`);
  }

  return slip;
}

export async function updateTransportSlip(id: string, data: Partial<TransportSlip>): Promise<TransportSlip> {
  const cleaned = cleanPayload(data);
  console.log('🚨 Cleaned data being sent to Supabase (transport):', cleaned);

  const { data: slip, error } = await supabase
    .from('transport_slips')
    .update(cleaned)
    .eq('id', id)
    .select(`
      id,
      number,
      status,
      client_id,
      client:client_id(nom),
      vehicule_id,
      vehicule:vehicule_id(immatriculation),
      loading_date,
      loading_time,
      loading_time_start,
      loading_time_end,
      loading_address,
      loading_contact,
      delivery_date,
      delivery_time,
      delivery_time_start,
      delivery_time_end,
      delivery_address,
      delivery_contact,
      goods_description,
      volume,
      weight,
      vehicle_type,
      custom_vehicle_type,
      exchange_type,
      instructions,
      price,
      payment_method,
      observations,
      photo_required,
      documents,
      order_number,
      tailgate,
      created_at,
      updated_at
    `)
    .single();

  console.log('📥 Response from Supabase (transport):', slip);

  if (error) {
    throw new Error(`Error updating transport slip: ${error.message}`);
  }

  if (!slip) {
    throw new Error(`Update failed: no data returned for transport slip with ID ${id}`);
  }

  return slip;
}

export async function getAllTransportSlips(startDate?: string, endDate?: string): Promise<TransportSlip[]> {
  let query = supabase
    .from('transport_slips')
    .select(`
      id,
      number,
      status,
      client_id,
      client:client_id(nom),
      vehicule_id,
      vehicule:vehicule_id(immatriculation),
      loading_date,
      loading_time,
      loading_time_start,
      loading_time_end,
      loading_address,
      loading_contact,
      delivery_date,
      delivery_time,
      delivery_time_start,
      delivery_time_end,
      delivery_address,
      delivery_contact,
      goods_description,
      volume,
      weight,
      vehicle_type,
      custom_vehicle_type,
      exchange_type,
      instructions,
      price,
      payment_method,
      observations,
      photo_required,
      documents,
      order_number,
      tailgate,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('loading_date', startDate);
  }
  if (endDate) {
    query = query.lte('loading_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error fetching transport slips: ${error.message}`);
  }

  return data || [];
}

export async function createFreightSlip(data: Omit<FreightSlip, 'id' | 'number' | 'created_at' | 'updated_at'>): Promise<FreightSlip> {
  const number = await getNextSlipNumber('freight');
  
  const payload = cleanPayload({
    ...data,
    number
  });

  const { data: slip, error } = await supabase
    .from('freight_slips')
    .insert([payload])
    .select(`
      id,
      number,
      status,
      client_id,
      client:client_id(nom),
      fournisseur_id,
      fournisseur:fournisseur_id(nom, telephone),
      loading_date,
      loading_time,
      loading_time_start,
      loading_time_end,
      loading_address,
      loading_contact,
      delivery_date,
      delivery_time,
      delivery_time_start,
      delivery_time_end,
      delivery_address,
      delivery_contact,
      goods_description,
      volume,
      weight,
      vehicle_type,
      custom_vehicle_type,
      exchange_type,
      instructions,
      price,
      payment_method,
      observations,
      photo_required,
      documents,
      commercial_id,
      order_number,
      purchase_price,
      selling_price,
      margin,
      margin_rate,
      tailgate,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw new Error(`Error creating freight slip: ${error.message}`);
  }

  return slip;
}

export async function updateFreightSlip(id: string, data: Partial<FreightSlip>): Promise<FreightSlip> {
  const cleaned = cleanPayload(data);
  console.log('🚨 Cleaned data being sent to Supabase:', cleaned);

  const { data: slip, error } = await supabase
    .from('freight_slips')
    .update(cleaned)
    .eq('id', id)
    .select(`
      id,
      number,
      status,
      client_id,
      client:client_id(nom),
      fournisseur_id,
      fournisseur:fournisseur_id(nom, telephone),
      loading_date,
      loading_time,
      loading_time_start,
      loading_time_end,
      loading_address,
      loading_contact,
      delivery_date,
      delivery_time,
      delivery_time_start,
      delivery_time_end,
      delivery_address,
      delivery_contact,
      goods_description,
      volume,
      weight,
      vehicle_type,
      custom_vehicle_type,
      exchange_type,
      instructions,
      price,
      payment_method,
      observations,
      photo_required,
      documents,
      commercial_id,
      order_number,
      purchase_price,
      selling_price,
      margin,
      margin_rate,
      tailgate,
      created_at,
      updated_at
    `)
    .single();

  console.log('📥 Response from Supabase:', slip);

  if (error) {
    throw new Error(`Error updating freight slip: ${error.message}`);
  }

  if (!slip) {
    throw new Error(`Update failed: no data returned for slip with ID ${id}`);
  }

  return slip;
}

export async function getAllFreightSlips(startDate?: string, endDate?: string): Promise<FreightSlip[]> {
  let query = supabase
    .from('freight_slips')
    .select(`
      id,
      number,
      status,
      client_id,
      client:client_id(nom),
      fournisseur_id,
      fournisseur:fournisseur_id(nom, telephone),
      loading_date,
      loading_time,
      loading_time_start,
      loading_time_end,
      loading_address,
      loading_contact,
      delivery_date,
      delivery_time,
      delivery_time_start,
      delivery_time_end,
      delivery_address,
      delivery_contact,
      goods_description,
      volume,
      weight,
      vehicle_type,
      custom_vehicle_type,
      exchange_type,
      instructions,
      price,
      payment_method,
      observations,
      photo_required,
      documents,
      commercial_id,
      order_number,
      purchase_price,
      selling_price,
      margin,
      margin_rate,
      tailgate,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('loading_date', startDate);
  }
  if (endDate) {
    query = query.lte('loading_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error fetching freight slips: ${error.message}`);
  }

  return data || [];
}

export async function updateSlipStatus(
  id: string,
  status: SlipStatus,
  type: 'transport' | 'freight'
): Promise<void> {
  const { error } = await supabase
    .from(type === 'transport' ? 'transport_slips' : 'freight_slips')
    .update({ status })
    .eq('id', id);

  if (error) {
    throw new Error(`Error updating slip status: ${error.message}`);
  }
}

export async function generatePDF(slip: TransportSlip | FreightSlip, type: 'transport' | 'freight' = 'transport'): Promise<Blob> {
  try {
    // Fetch template
    const templateUrl = type === 'transport' ? '/cmr.html' : '/affretement.html';
    const response = await fetch(templateUrl);
    const template = await response.text();

    // Create temporary container
    const container = document.createElement('div');
    container.style.width = '210mm';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Format loading time
    let loadingTime = '';
    if (slip.loading_time_start && slip.loading_time_end) {
      loadingTime = `${slip.loading_time_start.slice(0, 5)} à ${slip.loading_time_end.slice(0, 5)}`;
    } else if (slip.loading_time) {
      loadingTime = slip.loading_time.slice(0, 5);
    }

    // Format delivery time
    let deliveryTime = '';
    if (slip.delivery_time_start && slip.delivery_time_end) {
      deliveryTime = `${slip.delivery_time_start.slice(0, 5)} à ${slip.delivery_time_end.slice(0, 5)}`;
    } else if (slip.delivery_time) {
      deliveryTime = slip.delivery_time.slice(0, 5);
    } else {
      deliveryTime = 'Livraison foulée';
    }

    // Determine which urgency type is checked
    let urgenceChecked = '';
    let expressChecked = '';
    let standardChecked = '';
    
    if (slip.vehicle_type === 'T1') {
      urgenceChecked = 'checked';
    } else if (slip.vehicle_type === 'T2') {
      expressChecked = 'checked';
    } else if (slip.vehicle_type === 'T3') {
      standardChecked = 'checked';
    }

    // Determine exchange pallets options
    let chargeesChecked = '';
    let livreesChecked = '';
    let renduesExpediteurChecked = '';
    let renduesDestinataireChecked = '';
    
    if (slip.exchange_type === 'Oui') {
      chargeesChecked = 'checked';
      livreesChecked = 'checked';
    }

    // Prepare data
    const data = {
      donneur_ordre: slip.client?.nom || '',
      transporteur: type === 'freight' ? slip.fournisseur?.nom || '' : '',
      tel_transporteur: type === 'freight' ? slip.fournisseur?.telephone || '' : '',
      date: format(new Date(), 'dd/MM/yyyy', { locale: fr }),
      date_heure_chargement: `${format(new Date(slip.loading_date), 'dd/MM/yyyy', { locale: fr })} ${loadingTime}`,
      date_heure_livraison: `${format(new Date(slip.delivery_date), 'dd/MM/yyyy', { locale: fr })} ${deliveryTime}`,
      adresse_chargement: slip.loading_address || '',
      adresse_livraison: slip.delivery_address || '',
      contact_chargement: slip.loading_contact || '',
      contact_livraison: slip.delivery_contact || '',
      marchandise: slip.goods_description || '',
      volume: slip.volume?.toString() || '-',
      poids: slip.weight?.toString() || '-',
      prix_ht: type === 'freight' ? slip.selling_price?.toString() || '-' : slip.price?.toString() || '-',
      mode_reglement: slip.payment_method || '',
      nom_interlocuteur: type === 'freight' ? slip.commercial_id || 'NON RENSEIGNÉ' : '',
      number: slip.number || 'SANS NUMÉRO',
      instructions_chargement: '',
      instructions_livraison: '',
      instructions: slip.instructions || '',
      vehicle_type: slip.vehicle_type === 'Autre' ? slip.custom_vehicle_type : slip.vehicle_type || '',
      tailgate: slip.tailgate ? 'HAYON' : '',
      urgence_checked: urgenceChecked,
      express_checked: expressChecked,
      standard_checked: standardChecked,
      chargees_checked: chargeesChecked,
      livrees_checked: livreesChecked,
      rendues_expediteur_checked: renduesExpediteurChecked,
      rendues_destinataire_checked: renduesDestinataireChecked
    };

    // Replace placeholders
    let html = template;
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value?.toString() || '');
    });

    container.innerHTML = html;

    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 794,
      height: 1123
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add canvas to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

    // Clean up
    document.body.removeChild(container);
    
    // Return as blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

async function getNextSlipNumber(type: 'transport' | 'freight'): Promise<string> {
  const { data: existingConfig, error: checkError } = await supabase
    .from('slip_number_configs')
    .select('prefix, current_number')
    .eq('type', type)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Error checking slip number config: ${checkError.message}`);
  }

  if (!existingConfig) {
    const currentYear = new Date().getFullYear().toString();
    const defaultConfig = {
      type,
      prefix: currentYear,
      current_number: 0
    };

    const { error: insertError } = await supabase
      .from('slip_number_configs')
      .insert([defaultConfig]);

    if (insertError) {
      throw new Error(`Error creating default slip number config: ${insertError.message}`);
    }
  }

  const { data: config, error: fetchError } = await supabase
    .from('slip_number_configs')
    .select('prefix, current_number')
    .eq('type', type)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching slip number config: ${fetchError.message}`);
  }

  const nextNumber = config.current_number + 1;

  const { error: updateError } = await supabase
    .from('slip_number_configs')
    .update({ current_number: nextNumber })
    .eq('type', type);

  if (updateError) {
    throw new Error(`Error updating slip number: ${updateError.message}`);
  }

  return `${config.prefix} ${nextNumber.toString().padStart(4, '0')}`;
}